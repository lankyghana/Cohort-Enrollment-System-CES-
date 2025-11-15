# Setup Guide

This guide will walk you through setting up the Cohort Enrollment Platform from scratch.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 18+ and npm (or yarn/pnpm)
- **Git** for version control
- **Supabase Account** - [Sign up here](https://supabase.com)
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

## Step 3: Set Up Supabase

### 3.1 Create a Supabase Project

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Click "New Project"
3. Fill in your project details:
   - Name: Cohort Enrollment Platform
   - Database Password: (choose a strong password)
   - Region: (choose closest to your users)
4. Wait for the project to be created (takes ~2 minutes)

### 3.2 Get Your Supabase Credentials

1. In your Supabase project dashboard, go to **Settings** → **API**
2. Copy the following:
   - **Project URL** (under "Project URL")
   - **anon/public key** (under "Project API keys")

### 3.3 Set Up Database Schema

1. In Supabase dashboard, go to **SQL Editor**
2. Click "New Query"
3. Copy the entire contents of `supabase/schema.sql`
4. Paste into the SQL Editor
5. Click "Run" to execute the schema
6. Verify all tables are created by checking **Table Editor**

### 3.4 Configure Authentication

1. Go to **Authentication** → **Settings**
2. Configure the following:
   - **Site URL**: `http://localhost:5173` (for development)
   - **Redirect URLs**: Add `http://localhost:5173/**`
   - Enable **Email** authentication
   - Configure email templates if needed

## Step 4: Set Up Paystack

### 4.1 Create Paystack Account

1. Sign up at [Paystack](https://paystack.com)
2. Complete account verification
3. Get your API keys from **Settings** → **API Keys & Webhooks**

### 4.2 Get Paystack Public Key

- Copy your **Public Key** (starts with `pk_test_` for test mode or `pk_live_` for production)

## Step 5: Configure Environment Variables

1. Copy the example environment file:
   ```bash
   cp env.example .env
   ```

2. Open `.env` and fill in your credentials:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here

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

1. In Supabase dashboard, go to **Table Editor** → **users**
2. Find your user record
3. Edit the `role` field and change it from `student` to `admin`
4. Save the changes

Alternatively, you can use SQL:

```sql
UPDATE public.users
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
   - Check Supabase Table Editor to verify data is being saved

## Troubleshooting

### Issue: "Missing Supabase environment variables"

**Solution:** Make sure your `.env` file exists and contains valid Supabase credentials.

### Issue: "RLS policy violation"

**Solution:** Ensure you've run the complete `schema.sql` file, which includes all RLS policies.

### Issue: Cannot access admin routes

**Solution:** Verify your user role is set to `admin` in the `users` table.

### Issue: Email verification not working

**Solution:** 
- Check Supabase Authentication settings
- Verify redirect URLs are configured
- Check spam folder for verification emails

## Next Steps

- Review the [Architecture Documentation](./ARCHITECTURE.md)
- Read the [Development Guidelines](./DEVELOPMENT.md)
- Check the [API Documentation](./API.md)

## Support

If you encounter issues:
1. Check the [Troubleshooting](#troubleshooting) section
2. Review Supabase logs in the dashboard
3. Check browser console for errors
4. Create an issue in the repository

