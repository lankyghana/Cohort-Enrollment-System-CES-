<?php

namespace Tests\Feature;

use App\Mail\EnrollmentConfirmed;
use App\Models\Course;
use App\Models\Payment;
use App\Models\Setting;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class PaymentBalanceTest extends TestCase
{
    use RefreshDatabase;

    private function makeStudentPending(): User
    {
        return User::create([
            'name' => 'Pending Student',
            'email' => 'pendingstudent2@example.com',
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
            'email' => 'payinstructor2@example.com',
            'password' => 'password',
            'role' => 'instructor',
            'status' => 'active',
            'has_active_enrollment' => false,
        ]);
    }

    private function makePublishedCourse(int $instructorId): Course
    {
        return Course::create([
            'id' => (string) Str::uuid(),
            'title' => 'Course A',
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

    public function test_verify_updates_balance_due_without_double_counting(): void
    {
        Setting::setValue('platform_currency', 'GHS');
        Setting::setValue('enrollment_fee', '20');

        Mail::fake();

        $instructor = $this->makeInstructor();
        $course = $this->makePublishedCourse($instructor->id);
        $student = $this->makeStudentPending();

        $payment1 = new Payment();
        $payment1->id = (string) Str::uuid();
        $payment1->student_id = $student->id;
        $payment1->course_id = (string) $course->id;
        $payment1->amount = 20.0;
        $payment1->currency = 'GHS';
        $payment1->status = 'successful';
        $payment1->gateway = 'paystack';
        $payment1->payment_method = 'paystack';
        $payment1->reference = (string) Str::uuid();
        $payment1->paystack_reference = $payment1->reference;
        $payment1->payment_type = 'enrollment_fee';
        $payment1->amount_minor = 2000;
        $payment1->save();

        Sanctum::actingAs($student);

        $resp1 = $this->postJson('/api/payments/verify', ['reference' => $payment1->reference]);
        $resp1->assertStatus(200);

        $this->assertDatabaseHas('enrollments', [
            'student_id' => $student->id,
            'course_id' => (string) $course->id,
            'payment_status' => 'pending',
            'total_price' => 100.0,
            'amount_paid' => 20.0,
            'balance_due' => 80.0,
        ]);

        Mail::assertQueued(EnrollmentConfirmed::class, 1);

        // Calling verify again for the same successful payment must not double-count.
        $resp1b = $this->postJson('/api/payments/verify', ['reference' => $payment1->reference]);
        $resp1b->assertStatus(200);

        $this->assertDatabaseHas('enrollments', [
            'student_id' => $student->id,
            'course_id' => (string) $course->id,
            'amount_paid' => 20.0,
            'balance_due' => 80.0,
        ]);

        Mail::assertQueued(EnrollmentConfirmed::class, 1);

        $payment2 = new Payment();
        $payment2->id = (string) Str::uuid();
        $payment2->student_id = $student->id;
        $payment2->course_id = (string) $course->id;
        $payment2->amount = 80.0;
        $payment2->currency = 'GHS';
        $payment2->status = 'successful';
        $payment2->gateway = 'paystack';
        $payment2->payment_method = 'paystack';
        $payment2->reference = (string) Str::uuid();
        $payment2->paystack_reference = $payment2->reference;
        $payment2->payment_type = 'full';
        $payment2->amount_minor = 8000;
        $payment2->save();

        $resp2 = $this->postJson('/api/payments/verify', ['reference' => $payment2->reference]);
        $resp2->assertStatus(200);

        $this->assertDatabaseHas('enrollments', [
            'student_id' => $student->id,
            'course_id' => (string) $course->id,
            'payment_status' => 'paid',
            'amount_paid' => 100.0,
            'balance_due' => 0.0,
        ]);

        // Enrollment confirmation should still only be sent once.
        Mail::assertQueued(EnrollmentConfirmed::class, 1);
    }
}
