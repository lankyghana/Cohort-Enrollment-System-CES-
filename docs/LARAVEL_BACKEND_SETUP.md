# Laravel Backend Setup for Cohort Enrollment System

## Prerequisites
- PHP 8.2+ installed
- Composer installed
- MySQL or PostgreSQL

## Step 1: Create Laravel Project

```powershell
cd C:\Users\dktakyi001\Desktop
composer create-project laravel/laravel cohort-api
cd cohort-api
```

## Step 2: Install Laravel Sanctum (for API authentication)

```powershell
php artisan install:api
```

## Step 3: Configure Database

Edit `.env`:
```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=cohort_enrollment
DB_USERNAME=root
DB_PASSWORD=your_password
```

## Step 4: Create Database Models & Migrations

```powershell
# User model (already exists, we'll modify)
php artisan make:model Course -m
php artisan make:model CourseModule -m
php artisan make:model CourseSession -m
php artisan make:model Assignment -m
php artisan make:model Submission -m
php artisan make:model Enrollment -m
php artisan make:model Payment -m
php artisan make:model Certificate -m
php artisan make:model Resource -m
php artisan make:model Announcement -m
```

## Step 5: Run Migrations

```powershell
php artisan migrate
```

## Step 6: Create API Controllers

```powershell
php artisan make:controller Api/AuthController
php artisan make:controller Api/CourseController --api
php artisan make:controller Api/EnrollmentController --api
php artisan make:controller Api/InstructorController --api
```

## Step 7: Configure CORS

Edit `config/cors.php`:
```php
'paths' => ['api/*'],
'allowed_origins' => ['http://localhost:5173'],
'allowed_methods' => ['*'],
'allowed_headers' => ['*'],
'supports_credentials' => true,
```

## Step 8: Start Laravel Server

```powershell
php artisan serve --port=8000
```

API will be available at `http://localhost:8000/api`

## Step 9: Update React Frontend

Change API calls from Supabase to Laravel:
- Base URL: `http://localhost:8000/api`
- Auth: Use Laravel Sanctum tokens
- Storage: Laravel storage for thumbnails

## File Structure

```
cohort-api/
├── app/
│   ├── Models/
│   │   ├── User.php
│   │   ├── Course.php
│   │   ├── Enrollment.php
│   │   └── ...
│   ├── Http/
│   │   ├── Controllers/
│   │   │   └── Api/
│   │   │       ├── AuthController.php
│   │   │       ├── CourseController.php
│   │   │       └── ...
│   │   └── Middleware/
│   └── ...
├── database/
│   └── migrations/
├── routes/
│   ├── api.php
│   └── web.php
└── ...
```

## Next Steps

After setup, I'll help you:
1. Create all migration files with your database schema
2. Build API controllers with endpoints
3. Set up authentication with Sanctum
4. Update React frontend to use Laravel API
5. Integrate Paystack payments

Ready to proceed with Laravel?
