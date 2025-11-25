# Setup Guide

This guide will walk you through setting up the Cohort Enrollment Platform from scratch.

## Prerequisites

Before you begin, ensure you have the following installed:

- **PHP 8.1+** and **Composer**
- **Git** for version control
- **A local database server** (MySQL, PostgreSQL, etc.)
- **Paystack Account** - [Sign up here](https://paystack.com) (for payment integration)

## Step 1: Clone the Repository

```bash
git clone <repository-url>
cd cohort-enrollment-platform
```

## Step 2: Install Dependencies

```bash
npm install
```

## Step 3: Set Up Backend (Laravel)

The backend is a Laravel application located in the `backend` directory.

1.  Navigate to the backend directory:
    ```bash
    cd backend
    ```
2.  Install PHP dependencies:
    ```bash
    composer install
    ```
3.  Create an environment file:
    ```bash
    cp .env.example .env
    ```
4.  Generate an application key:
    ```bash
    php artisan key:generate
    ```
5.  Configure your `.env` file with your database credentials and other settings.
6.  Run the database migrations and seeders:
    ```bash
    php artisan migrate --seed
    ```
7.  Start the local Laravel development server:
    ```bash
    php artisan serve
    ```
    This will typically start the backend on `http://localhost:8000`.

## Step 4: Set Up Paystack

### 4.1 Create Paystack Account

1. Sign up at [Paystack](https://paystack.com)
2. Complete account verification
3. Get your API keys from **Settings** → **API Keys & Webhooks**

### 4.2 Get Paystack Public Key

- Copy your **Public Key** (starts with `pk_test_` for test mode or `pk_live_` for production)

## Step 5: Configure Environment Variables

1. In the root project directory, copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Open `.env` and fill in your credentials:

```env
# Laravel API Configuration
VITE_API_BASE_URL=http://localhost:8000

# Paystack Configuration
VITE_PAYSTACK_PUBLIC_KEY=pk_test_your_key_here

# Application Configuration
VITE_APP_URL=http://localhost:5173
VITE_APP_NAME=Cohort Enrollment Platform

# Environment
NODE_ENV=development
```

**⚠️ Important:** Never commit your `.env` file to version control. It's already in `.gitignore`.

## Step 6: Create Your First Admin User

### 6.1 Register via the Application

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Navigate to `http://localhost:5173/register`
3. Create an account with your email

### 6.2 Grant Admin Role

1.  The database seeder (`database/seeders/DatabaseSeeder.php`) likely creates a default admin user. Check the seeder file for the credentials.
2.  If you need to make another user an admin, you can do so by updating the `role` field in the `users` table in your database directly.

For example, using a SQL client:
```sql
UPDATE users
SET role = 'admin'
WHERE email = 'your-email@example.com';
```

## Step 7: Run the Development Server

```bash
npm run dev
```

The application should now be running at `http://localhost:5173`

## Step 8: Verify Installation

1. **Test Authentication:**
   - Register a new account
   - Verify email (check your inbox)
   - Login successfully

2. **Test Admin Access:**
   - Login with your admin account
   - Navigate to `/admin`
   - You should see the admin dashboard

3. **Test Database Connection:**
   - Try creating a course in the admin panel
   - Check your database to verify data is being saved

## Troubleshooting

### Issue: "Missing API environment variables"

**Solution:** Make sure your `.env` file exists in the root of the frontend project and contains a valid `VITE_API_BASE_URL`.

### Issue: "API connection refused"

**Solution:** Ensure your Laravel backend server is running.

### Issue: Cannot access admin routes

**Solution:** Verify your user role is set to `admin` in the `users` table in your database.

### Issue: Email verification not working

**Solution:** 
- Check your Laravel backend's mail configuration in its `.env` file.
- Verify that your mail driver (e.g., SMTP, Mailgun) is set up correctly.
- Check spam folder for verification emails.

## Next Steps

- Review the [Architecture Documentation](./ARCHITECTURE.md)
- Read the [Development Guidelines](./DEVELOPMENT.md)
- Check the [API Documentation](./API.md)

## Support

If you encounter issues:
1. Check the [Troubleshooting](#troubleshooting) section
2. Review Laravel logs in `backend/storage/logs`
3. Check browser console for errors
4. Create an issue in the repository

