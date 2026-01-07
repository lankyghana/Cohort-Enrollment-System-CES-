<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Hash;
use App\Models\User;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Artisan::command('app:bootstrap-admin {--email=} {--name=} {--password=} {--force}', function () {
    $email = (string) ($this->option('email') ?: env('DEFAULT_ADMIN_EMAIL') ?: '');
    $name = (string) ($this->option('name') ?: env('DEFAULT_ADMIN_NAME') ?: 'Admin');
    $password = (string) ($this->option('password') ?: env('DEFAULT_ADMIN_PASSWORD') ?: '');
    $force = (bool) $this->option('force');

    if ($email === '') {
        $this->error('Admin email is required. Pass --email=... or set DEFAULT_ADMIN_EMAIL in .env');
        return 1;
    }

    $user = User::query()->where('email', $email)->first();
    $isNew = ! $user;

    if ($isNew && $password === '') {
        $this->error('Admin password is required when creating a new admin. Pass --password=... or set DEFAULT_ADMIN_PASSWORD in .env');
        return 1;
    }

    if (! $isNew && ! $force) {
        $this->info('User already exists. Use --force to update role/status (and password if provided).');
        return 0;
    }

    if ($isNew) {
        $user = User::create([
            'name' => $name,
            'full_name' => $name,
            'email' => $email,
            'phone' => '',
            'password' => Hash::make($password),
            'role' => 'admin',
            'status' => 'active',
            'has_active_enrollment' => true,
        ]);
    } else {
        $user->name = $name ?: (string) $user->name;
        $user->full_name = $name ?: (string) ($user->full_name ?? $user->name);
        $user->role = 'admin';
        $user->status = 'active';
        $user->has_active_enrollment = true;
        if ($password !== '') {
            $user->password = Hash::make($password);
        }
        $user->save();
    }

    $this->info('Admin bootstrapped: ' . $user->email);
    return 0;
})->purpose('Create/update an admin user (for first-time production setup)');
