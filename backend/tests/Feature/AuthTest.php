<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\User;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_register_and_login()
    {
        // Register
        $response = $this->postJson('/api/register', [
            'name' => 'Test User',
            'email' => 'testuser@example.com',
            'phone' => '+233241234567',
            'password' => 'password1',
            'role' => 'student',
        ]);
        $response->assertStatus(201);
        $this->assertDatabaseHas('users', ['email' => 'testuser@example.com']);

        // Login
        $response = $this->postJson('/api/login', [
            'email' => 'testuser@example.com',
            'password' => 'password1',
            'login_as' => 'student',
        ]);
        $response->assertStatus(200);
        $response->assertJsonStructure(['next_step', 'enrollment_intent_id']);
    }
}
