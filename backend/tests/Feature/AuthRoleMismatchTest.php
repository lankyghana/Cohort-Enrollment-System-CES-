<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class AuthRoleMismatchTest extends TestCase
{
    use RefreshDatabase;

    public function test_instructor_credentials_with_student_login_returns_403_and_issues_no_token(): void
    {
        $user = User::factory()->create([
            'email' => 'instructor@example.com',
            'password' => Hash::make('password1'),
            'role' => 'instructor',
            'status' => 'active',
            'has_active_enrollment' => true,
        ]);

        $resp = $this->postJson('/api/login', [
            'email' => $user->email,
            'password' => 'password1',
            'login_as' => 'student',
        ]);

        $resp->assertStatus(403);
        $resp->assertJson([
            'code' => 'ROLE_MISMATCH',
        ]);

        $this->assertDatabaseMissing('personal_access_tokens', [
            'tokenable_id' => $user->id,
            'tokenable_type' => User::class,
        ]);
    }

    public function test_student_credentials_with_instructor_login_returns_403_and_issues_no_token(): void
    {
        $user = User::factory()->create([
            'email' => 'student@example.com',
            'password' => Hash::make('password1'),
            'role' => 'student',
            'status' => 'active',
            'has_active_enrollment' => true,
        ]);

        $resp = $this->postJson('/api/login', [
            'email' => $user->email,
            'password' => 'password1',
            'login_as' => 'instructor',
        ]);

        $resp->assertStatus(403);
        $resp->assertJson([
            'code' => 'ROLE_MISMATCH',
        ]);

        $this->assertDatabaseMissing('personal_access_tokens', [
            'tokenable_id' => $user->id,
            'tokenable_type' => User::class,
        ]);
    }

    public function test_correct_role_login_issues_token(): void
    {
        $user = User::factory()->create([
            'email' => 'ok-instructor@example.com',
            'password' => Hash::make('password1'),
            'role' => 'instructor',
            'status' => 'active',
            'has_active_enrollment' => true,
        ]);

        $resp = $this->postJson('/api/login', [
            'email' => $user->email,
            'password' => 'password1',
            'login_as' => 'instructor',
        ]);

        $resp->assertStatus(200);
        $resp->assertJsonStructure([
            'user',
            'token',
        ]);

        $this->assertDatabaseHas('personal_access_tokens', [
            'tokenable_id' => $user->id,
            'tokenable_type' => User::class,
        ]);
    }
}
