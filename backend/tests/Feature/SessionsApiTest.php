<?php

namespace Tests\Feature;

use App\Models\Course;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class SessionsApiTest extends TestCase
{
    use RefreshDatabase;

    private function makeInstructor(): User
    {
        return User::create([
            'name' => 'Instructor',
            'email' => 'instructor@example.com',
            'password' => 'password',
            'role' => 'instructor',
            'status' => 'active',
            'has_active_enrollment' => false,
        ]);
    }

    private function makeActiveStudent(string $email = 'student@example.com'): User
    {
        return User::create([
            'name' => 'Student',
            'email' => $email,
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
            'title' => 'Test Course',
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

    public function test_sessions_endpoints_require_authentication(): void
    {
        $resp = $this->getJson('/api/courses/' . (string) Str::uuid() . '/sessions');
        $resp->assertStatus(401);

        $resp = $this->getJson('/api/sessions/' . (string) Str::uuid());
        $resp->assertStatus(401);
    }

    public function test_authenticated_but_not_enrolled_user_gets_403(): void
    {
        $instructor = $this->makeInstructor();
        $course = $this->makePublishedCourse($instructor->id);
        $student = $this->makeActiveStudent('notenrolled@example.com');

        Sanctum::actingAs($student);

        $resp = $this->getJson('/api/courses/' . $course->id . '/sessions');
        $resp->assertStatus(403);
    }

    public function test_enrolled_student_can_list_sessions_and_fetch_session_details(): void
    {
        $instructor = $this->makeInstructor();
        $course = $this->makePublishedCourse($instructor->id);
        $student = $this->makeActiveStudent('enrolled@example.com');

        DB::table('enrollments')->insert([
            'id' => (string) Str::uuid(),
            'student_id' => $student->id,
            'course_id' => (string) $course->id,
            'payment_status' => 'paid',
            'amount_paid' => 100,
            'enrolled_at' => now(),
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $sessionId = (string) Str::uuid();
        DB::table('course_sessions')->insert([
            'id' => $sessionId,
            'course_id' => (string) $course->id,
            'module_id' => null,
            'title' => 'Live Session 1',
            'description' => 'Intro',
            'meeting_link' => 'https://example.com/meet',
            'scheduled_at' => now()->addDay(),
            'duration_minutes' => 60,
            'status' => 'scheduled',
            'recording_url' => null,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        Sanctum::actingAs($student);

        $list = $this->getJson('/api/courses/' . $course->id . '/sessions');
        $list->assertStatus(200);
        $list->assertJsonFragment(['id' => $sessionId]);

        $show = $this->getJson('/api/sessions/' . $sessionId);
        $show->assertStatus(200);
        $show->assertJsonFragment(['id' => $sessionId]);
        $show->assertJsonFragment(['title' => 'Live Session 1']);
    }

    public function test_empty_sessions_returns_empty_array(): void
    {
        $instructor = $this->makeInstructor();
        $course = $this->makePublishedCourse($instructor->id);
        $student = $this->makeActiveStudent('emptysessions@example.com');

        DB::table('enrollments')->insert([
            'id' => (string) Str::uuid(),
            'student_id' => $student->id,
            'course_id' => (string) $course->id,
            'payment_status' => 'paid',
            'amount_paid' => 100,
            'enrolled_at' => now(),
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        Sanctum::actingAs($student);
        $resp = $this->getJson('/api/courses/' . $course->id . '/sessions');
        $resp->assertStatus(200);
        $resp->assertExactJson([]);
    }

    public function test_sessions_do_not_leak_across_courses(): void
    {
        $instructor = $this->makeInstructor();
        $courseA = $this->makePublishedCourse($instructor->id);
        $courseB = $this->makePublishedCourse($instructor->id);
        $student = $this->makeActiveStudent('noleak@example.com');

        DB::table('enrollments')->insert([
            'id' => (string) Str::uuid(),
            'student_id' => $student->id,
            'course_id' => (string) $courseA->id,
            'payment_status' => 'paid',
            'amount_paid' => 100,
            'enrolled_at' => now(),
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $sessionB = (string) Str::uuid();
        DB::table('course_sessions')->insert([
            'id' => $sessionB,
            'course_id' => (string) $courseB->id,
            'module_id' => null,
            'title' => 'Other Course Session',
            'description' => null,
            'meeting_link' => null,
            'scheduled_at' => now()->addDays(2),
            'duration_minutes' => 60,
            'status' => 'scheduled',
            'recording_url' => null,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        Sanctum::actingAs($student);

        $listA = $this->getJson('/api/courses/' . $courseA->id . '/sessions');
        $listA->assertStatus(200);
        $listA->assertJsonMissing(['id' => $sessionB]);

        $showB = $this->getJson('/api/sessions/' . $sessionB);
        $showB->assertStatus(403);
    }
}
