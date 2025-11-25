# Laravel Setup Guide

This guide will walk you through setting up the Laravel backend for the Cohort Enrollment Platform.

## Step 1: Get Your Environment Ready

### 1.1 Install Dependencies

1.  Navigate to the `backend` directory:
    ```bash
    cd backend
    ```
2.  Install PHP dependencies with Composer:
    ```bash
    composer install
    ```
3.  Install Node.js dependencies:
    ```bash
    npm install
    ```

### 1.2 Configure Environment

1.  Create a `.env` file from the example:
    ```bash
    cp .env.example .env
    ```
2.  Generate an application key:
    ```bash
    php artisan key:generate
    ```
3.  Configure your database connection in the `.env` file. For example, for a local MySQL database:
    ```env
    DB_CONNECTION=mysql
    DB_HOST=127.0.0.1
    DB_PORT=3306
    DB_DATABASE=cohort_platform
    DB_USERNAME=root
    DB_PASSWORD=
    ```
4. Configure your mail driver and Paystack keys in `.env`:
    ```env
    MAIL_MAILER=smtp
    MAIL_HOST=mailpit
    MAIL_PORT=1025
    MAIL_USERNAME=null
    MAIL_PASSWORD=null
    MAIL_ENCRYPTION=null
    
    PAYSTACK_PUBLIC_KEY=your_paystack_public_key
    PAYSTACK_SECRET_KEY=your_paystack_secret_key
    ```

## Step 2: Set Up Database

### 2.1 Create the Database

Ensure you have created the database specified in your `.env` file (e.g., `cohort_platform`).

### 2.2 Run Migrations

Run the database migrations to create the necessary tables:
```bash
php artisan migrate
```

### 2.3 (Optional) Seed the Database

You can seed the database with some sample data:
```bash
php artisan db:seed
```

## Step 3: Start the Server

Start the Laravel development server:
```bash
php artisan serve
```

The backend will now be running at `http://localhost:8000`.

## Step 4: Configure Frontend

Update your frontend's root `.env` file to point to the Laravel backend:
```env
VITE_API_BASE_URL=http://localhost:8000
VITE_PAYSTACK_PUBLIC_KEY=pk_test_xxxxxxxxxxxxxxxxxxxxxxxx
```

## Step 5: Test the Connection

### 5.1 Start Your Frontend Development Server

In the project root directory:
```bash
npm run dev
```

### 5.2 Check for Errors

1.  Open your browser and navigate to `http://localhost:5173`.
2.  Open the browser console (F12).
3.  Check for any connection errors. If the frontend can't reach the backend, you'll see network errors related to `http://localhost:8000`.

## Step 6: Create Your First Admin User

### 6.1 Register via the App

1.  Go to `http://localhost:5173/register`.
2.  Create an account. Laravel's default setup may require email verification depending on the configuration in `app/Models/User.php`.

### 6.2 Grant Admin Role

**Option A: Using a Database GUI (like TablePlus, DBeaver)**

1.  Connect to your database (`cohort_platform`).
2.  Open the `users` table.
3.  Find your user record by email.
4.  Change the `role` column from `student` to `admin`.
5.  Save the changes.

**Option B: Using Laravel Tinker**

1.  Open a new terminal in the `backend` directory.
2.  Run the following commands:
    ```bash
    php artisan tinker
    ```
    ```php
    // Inside tinker
    $user = App\Models\User::where('email', 'your-email@example.com')->first();
    $user->role = 'admin';
    $user->save();
    exit;
    ```

### 6.3 Verify Admin Access

1.  Log out and log back in to the application.
2.  Navigate to `http://localhost:5173/admin`.
3.  You should now see the admin dashboard.

## Troubleshooting

### Issue: "Connection refused" for API calls

**Solution:**
-   Ensure the Laravel server is running (`php artisan serve`).
-   Verify `VITE_API_BASE_URL` in the frontend `.env` file is correct.
-   Check for firewall or proxy issues that might block the connection.

### Issue: "401 Unauthorized" or "403 Forbidden"

**Solution:**
-   Ensure you are logged in.
-   For admin routes, verify your user's `role` is correctly set to `admin` in the database.
-   Check Laravel's authorization policies (`app/Policies`) to ensure they are correctly defined for the action you are trying to perform.

### Issue: Email verification not working

**Solution:**
-   Check your mail configuration in the backend `.env` file. For local development, using Mailtrap or Mailpit is recommended.
-   Ensure the `MAIL_FROM_ADDRESS` is a valid email address.
-   Check the Laravel logs (`storage/logs/laravel.log`) for any mail-related errors.

## Next Steps

Once the Laravel backend is set up:

1.  ✅ Test user registration and login.
2.  ✅ Verify admin dashboard access.
3.  ✅ Set up Paystack correctly (see `PAYMENT_SETUP.md`).
4.  ✅ Continue feature development!

## Additional Resources

-   [Laravel Documentation](https://laravel.com/docs)
-   [Laravel Sanctum (Authentication)](https://laravel.com/docs/sanctum)
-   [Laravel Policies (Authorization)](https://laravel.com/docs/authorization#policies)

## Security Notes

⚠️ **Important Security Reminders:**

1.  **Never commit your `.env` files.** They are already in `.gitignore`.
2.  **Use API Tokens Securely.** Laravel Sanctum handles API token authentication. Ensure tokens are not exposed.
3.  **Authorization is Key.** Use Laravel Policies to protect all sensitive data and actions.
4.  **Environment variables.** Use different keys and configurations for development and production.

## Production Setup

When deploying to production:

1.  Set up a production-ready server (e.g., on DigitalOcean, AWS, or a managed hosting provider like Laravel Forge).
2.  Configure a production database.
3.  Update production environment variables in your hosting environment, including `APP_KEY`, database credentials, and production API keys for services like Paystack and your email provider.
4.  Set `APP_ENV=production` and `APP_DEBUG=false` in your production `.env` file for security and performance.
5.  Configure your web server (Nginx or Apache) to point to the `public` directory of your Laravel installation.
6.  Run `composer install --no-dev --optimize-autoloader` and `npm run build` for production assets.
7.  Run `php artisan config:cache`, `php artisan route:cache`, and `php artisan view:cache` to optimize your application.

