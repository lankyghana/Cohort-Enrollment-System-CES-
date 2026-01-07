<?php

namespace Tests\Feature;

use App\Models\Course;
use App\Models\Setting;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class BalancePaymentInitiationTest extends TestCase
{
    use RefreshDatabase;

    private function makeInstructor(): User
    {
        return User::create([
            'name' => 'Instructor',
            'email' => 'balance-instructor@example.com',
            'password' => 'password',
            'role' => 'instructor',
            'status' => 'active',
            'has_active_enrollment' => false,
        ]);
    }

    private function makeActiveStudent(): User
    {
        return User::create([
            'name' => 'Student',
            'email' => 'balance-student@example.com',
            'password' => 'password',
            'role' => 'student',
            'status' => 'active',
            'has_active_enrollment' => true,
        ]);
    }

    private function makePublishedCourse(int $instructorId): Course
    {
        return Course::create([
            'id' => (string) Str::uuid(),
            'title' => 'Balance Course',
            'description' => 'Test description',
            'instructor_id' => $instructorId,
            'price' => 100,
            'currency' => 'GHS',
            'duration_weeks' => 4,
            'start_date' => now()->subDay(),
            'status' => 'published',
            'published' => true,
        ]);
    }

    public function test_authenticated_student_can_initiate_balance_payment_idempotently(): void
    {
        Setting::setValue('platform_currency', 'GHS');
        Setting::setValue('payment_active_gateway', 'paystack');
        Setting::setValue('paystack_secret_key', 'test_secret_key');

        Http::fake([
            'https://api.paystack.co/transaction/initialize' => Http::sequence()
                ->push([
                    'status' => true,
                    'data' => [
                        'authorization_url' => 'https://checkout.paystack.example/balance123',
                    ],
                ], 200)
                ->push([
                    'status' => true,
                    'data' => [
                        'authorization_url' => 'https://checkout.paystack.example/balance456',
                    ],
                ], 200),
        ]);

        $instructor = $this->makeInstructor();
        $course = $this->makePublishedCourse($instructor->id);
        $student = $this->makeActiveStudent();

        DB::table('enrollments')->insert([
            'id' => (string) Str::uuid(),
            'student_id' => $student->id,
            'course_id' => (string) $course->id,
            'payment_id' => null,
            'enrolled_at' => now(),
            'payment_status' => 'pending',
            'amount_paid' => 20,
            'total_price' => 100,
            'balance_due' => 80,
            'payment_deadline' => now()->subHour(),
            'access_locked' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        Sanctum::actingAs($student);

        $headers = ['Origin' => 'http://localhost:5173'];

        $first = $this->postJson('/api/payments/initiate', [
            'course_id' => (string) $course->id,
            'payment_type' => 'balance',
        ], $headers);

        $first->assertStatus(200);
        $first->assertJsonFragment(['payment_url' => 'https://checkout.paystack.example/balance123']);

        $this->assertDatabaseHas('payments', [
            'student_id' => $student->id,
            'course_id' => (string) $course->id,
            'status' => 'pending',
            'payment_type' => 'balance',
            'amount' => 80.0,
        ]);

        $this->assertDatabaseCount('payments', 1);

        // Repeat should start a new payment.
        $second = $this->postJson('/api/payments/initiate', [
            'course_id' => (string) $course->id,
            'payment_type' => 'balance',
        ], $headers);

        $second->assertStatus(200);
        $second->assertJsonFragment(['payment_url' => 'https://checkout.paystack.example/balance456']);
        $this->assertDatabaseCount('payments', 2);
    }
}
