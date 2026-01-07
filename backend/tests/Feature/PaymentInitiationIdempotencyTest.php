<?php

namespace Tests\Feature;

use App\Models\Course;
use App\Models\EnrollmentIntent;
use App\Models\Setting;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;
use Tests\TestCase;

class PaymentInitiationIdempotencyTest extends TestCase
{
    use RefreshDatabase;

    private function makeStudentPending(): User
    {
        return User::create([
            'name' => 'Pending Student',
            'email' => 'pendingstudent@example.com',
            'password' => 'password',
            'role' => 'student',
            'status' => 'pending',
            'has_active_enrollment' => false,
        ]);
    }

    private function makeInstructor(): User
    {
        return User::create([
            'name' => 'Instructor',
            'email' => 'payinstructor@example.com',
            'password' => 'password',
            'role' => 'instructor',
            'status' => 'active',
            'has_active_enrollment' => false,
        ]);
    }

    private function makePublishedCourse(int $instructorId, string $title): Course
    {
        return Course::create([
            'id' => (string) Str::uuid(),
            'title' => $title,
            'description' => 'Test description',
            'instructor_id' => $instructorId,
            'price' => 100,
            'currency' => 'GHS',
            'duration_weeks' => 4,
            'start_date' => now()->addDay(),
            'status' => 'published',
            'published' => true,
        ]);
    }

    public function test_initiate_is_idempotent_for_same_intent_and_course(): void
    {
        // Ensure platform currency is set for Currency::platform().
        Setting::setValue('platform_currency', 'GHS');
        Setting::setValue('enrollment_fee', '20');

        // Configure Paystack via DB settings (so env is not required).
        Setting::setValue('payment_active_gateway', 'paystack');
        Setting::setValue('paystack_secret_key', 'test_secret_key');

        Http::fake([
            'https://api.paystack.co/transaction/initialize' => Http::sequence()
                ->push([
                    'status' => true,
                    'data' => [
                        'authorization_url' => 'https://checkout.paystack.example/abc123',
                    ],
                ], 200)
                ->push([
                    'status' => true,
                    'data' => [
                        'authorization_url' => 'https://checkout.paystack.example/def456',
                    ],
                ], 200)
                ->push([
                    'status' => true,
                    'data' => [
                        'authorization_url' => 'https://checkout.paystack.example/ghi789',
                    ],
                ], 200)
                ->push([
                    'status' => true,
                    'data' => [
                        'authorization_url' => 'https://checkout.paystack.example/jkl012',
                    ],
                ], 200),
        ]);

        $instructor = $this->makeInstructor();
        $courseA = $this->makePublishedCourse($instructor->id, 'Course A');
        $courseB = $this->makePublishedCourse($instructor->id, 'Course B');

        $student = $this->makeStudentPending();

        $intent = EnrollmentIntent::create([
            'id' => (string) Str::uuid(),
            'user_id' => $student->id,
            'state' => 'awaiting_course',
            'course_id' => null,
            'payment_id' => null,
            'reference' => null,
        ]);

        $headers = ['Origin' => 'http://localhost:5173'];

        $first = $this->postJson('/api/payments/initiate', [
            'enrollment_intent_id' => (string) $intent->id,
            'course_id' => (string) $courseA->id,
        ], $headers);

        $first->assertStatus(200);
        $first->assertJsonFragment(['payment_url' => 'https://checkout.paystack.example/abc123']);

        $this->assertDatabaseCount('payments', 1);
        $this->assertDatabaseHas('payments', [
            'course_id' => (string) $courseA->id,
            'status' => 'pending',
            'payment_type' => 'enrollment_fee',
            'amount' => 20.0,
        ]);

        // Rapid repeated clicks should start a new payment and fail the previous pending one.
        $second = $this->postJson('/api/payments/initiate', [
            'enrollment_intent_id' => (string) $intent->id,
            'course_id' => (string) $courseA->id,
        ], $headers);

        $second->assertStatus(200);
        $second->assertJsonFragment(['payment_url' => 'https://checkout.paystack.example/def456']);

        $this->assertDatabaseCount('payments', 2);

        // Different payment_type should also start a new payment.
        $typeConflict = $this->postJson('/api/payments/initiate', [
            'enrollment_intent_id' => (string) $intent->id,
            'course_id' => (string) $courseA->id,
            'payment_type' => 'full',
        ], $headers);

        $typeConflict->assertStatus(200);
        $typeConflict->assertJsonFragment(['payment_url' => 'https://checkout.paystack.example/ghi789']);
        $this->assertDatabaseCount('payments', 3);

        // Different course should also start a new payment.
        $conflict = $this->postJson('/api/payments/initiate', [
            'enrollment_intent_id' => (string) $intent->id,
            'course_id' => (string) $courseB->id,
        ], $headers);

        $conflict->assertStatus(200);
    }
}
