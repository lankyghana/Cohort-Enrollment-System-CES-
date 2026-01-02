<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        $email = env('DEFAULT_ADMIN_EMAIL');
        $password = env('DEFAULT_ADMIN_PASSWORD');
        $name = env('DEFAULT_ADMIN_NAME', 'Admin');

        if (! $email || ! $password) {
            $this->command?->warn('DEFAULT_ADMIN_EMAIL / DEFAULT_ADMIN_PASSWORD not set; skipping admin user seed.');
            return;
        }

        User::updateOrCreate(
            ['email' => $email],
            [
                'name' => $name,
                'password' => Hash::make($password),
                'role' => 'admin',
            ]
        );

        $this->command?->info("Admin user ensured for {$email}");
    }
}
