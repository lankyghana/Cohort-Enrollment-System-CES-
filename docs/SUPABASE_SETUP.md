# Supabase Setup Guide

This guide will walk you through setting up Supabase for the Cohort Enrollment Platform.

## Step 1: Get Your Supabase Credentials

### 1.1 Access Supabase Dashboard

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Sign in or create an account
3. Select your project (or create a new one)

### 1.2 Get Project URL and API Key

1. In your Supabase project, go to **Settings** (gear icon in sidebar)
2. Click on **API** in the settings menu
3. You'll see two important values:

   **Project URL:**
   ```
   https://your-project.supabase.co  # REPLACE_WITH_YOUR_PROJECT_URL
   ```
   - This is your `VITE_SUPABASE_URL`
   - Copy this value

   **anon/public key:**
   ```
   your_anon_public_key_here  # REPLACE_WITH_YOUR_ANON_KEY
   ```
   - This is your `VITE_SUPABASE_ANON_KEY`
   - Click the "Reveal" button to see the full key
   - Copy this value

### 1.3 Update Your .env File

1. Create a `.env` file in the project root (if it doesn't exist):
   ```bash
   cp env.example .env
   ```

2. Open `.env` and update with your credentials:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co  # REPLACE_WITH_YOUR_PROJECT_URL
   VITE_SUPABASE_ANON_KEY=your_anon_public_key_here  # REPLACE_WITH_YOUR_ANON_KEY
   ```

   ⚠️ **Important:** Replace with your actual values from Step 1.2

## Step 2: Set Up Database Schema

### 2.1 Open SQL Editor

1. In Supabase Dashboard, click on **SQL Editor** in the sidebar
2. Click **New Query**

### 2.2 Run the Schema Script

1. Open the file `supabase/schema.sql` from this project
2. Copy the **entire contents** of the file
3. Paste into the SQL Editor in Supabase
4. Click **Run** (or press Ctrl+Enter / Cmd+Enter)

### 2.3 Verify Tables Created

1. Go to **Table Editor** in the sidebar
2. You should see these tables:
   - ✅ users
   - ✅ courses
   - ✅ course_modules
   - ✅ course_sessions
   - ✅ enrollments
   - ✅ payments
   - ✅ resources
   - ✅ certificates
   - ✅ announcements
   - ✅ messages

If all tables are present, the schema setup is complete!

## Step 3: Configure Authentication

### 3.1 Set Up Email Authentication

1. Go to **Authentication** → **Settings**
2. Under **Auth Providers**, ensure **Email** is enabled
3. Configure the following:

   **Site URL:**
   ```
   http://localhost:5173
   ```
   (For production, use your actual domain)

   **Redirect URLs:**
   Add these URLs:
   ```
   http://localhost:5173/**
   http://localhost:5173/auth/callback
   ```

### 3.2 Configure Email Templates (Optional)

1. Go to **Authentication** → **Email Templates**
2. Customize templates if needed:
   - Confirm signup
   - Magic Link
   - Change Email Address
   - Reset Password

## Step 4: Set Up Storage Buckets

### 4.1 Create Storage Buckets

1. Go to **Storage** in the sidebar
2. Click **New bucket**
3. Create these buckets:

   **Bucket 1: course-resources**
   - Name: `course-resources`
   - Public: ✅ Yes (or No, depending on your needs)
   - File size limit: 50 MB (adjust as needed)

   **Bucket 2: certificates**
   - Name: `certificates`
   - Public: ✅ Yes
   - File size limit: 10 MB

   **Bucket 3: avatars**
   - Name: `avatars`
   - Public: ✅ Yes
   - File size limit: 5 MB

### 4.2 Set Storage Policies (Optional)

For each bucket, you can set policies in **Storage** → **Policies** to control access.

## Step 5: Test the Connection

### 5.1 Start Your Development Server

```bash
npm run dev
```

### 5.2 Check for Errors

1. Open your browser console (F12)
2. Navigate to `http://localhost:5173`
3. Check for any Supabase connection errors

If you see "Missing Supabase environment variables", double-check your `.env` file.

## Step 6: Create Your First Admin User

### 6.1 Register via the App

1. Go to `http://localhost:5173/register`
2. Create an account with your email
3. Check your email for verification link
4. Click the verification link
5. Log in to the application

### 6.2 Grant Admin Role

**Option A: Using Supabase Dashboard**

1. Go to **Table Editor** → **users**
2. Find your user record (by email)
3. Click on the row to edit
4. Change `role` from `student` to `admin`
5. Click **Save**

**Option B: Using SQL Editor**

1. Go to **SQL Editor**
2. Run this query (replace with your email):
   ```sql
   UPDATE public.users
   SET role = 'admin'
   WHERE email = 'your-email@example.com';
   ```
3. Click **Run**

### 6.3 Verify Admin Access

1. Log out and log back in
2. Navigate to `http://localhost:5173/admin`
3. You should see the admin dashboard

## Troubleshooting

### Issue: "Missing Supabase environment variables"

**Solution:**
- Make sure `.env` file exists in the project root
- Verify the variable names start with `VITE_`
- Restart your dev server after changing `.env`

### Issue: "Invalid API key"

**Solution:**
- Double-check you copied the **anon/public** key (not the service_role key)
- Make sure there are no extra spaces in your `.env` file
- The key should start with `eyJ...`

### Issue: "RLS policy violation"

**Solution:**
- Make sure you ran the complete `schema.sql` file
- Check that RLS is enabled on all tables
- Verify your user role is set correctly

### Issue: Email verification not working

**Solution:**
- Check **Authentication** → **Settings** → **Site URL** is set correctly
- Verify redirect URLs include `http://localhost:5173/**`
- Check your spam folder for verification emails
- In development, you can disable email confirmation temporarily in Auth settings

### Issue: Cannot access admin routes

**Solution:**
- Verify your user's `role` is set to `admin` in the `users` table
- Log out and log back in after changing the role
- Check browser console for any errors

## Next Steps

Once Supabase is set up:

1. ✅ Test user registration and login
2. ✅ Verify admin dashboard access
3. ✅ Set up Paystack (see Paystack setup guide)
4. ✅ Start building features!

## Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Auth Guide](https://supabase.com/docs/guides/auth)
- [Supabase Storage Guide](https://supabase.com/docs/guides/storage)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)

## Security Notes

⚠️ **Important Security Reminders:**

1. **Never commit your `.env` file** - It's already in `.gitignore`
2. **Use anon key in frontend** - Never use service_role key in client code
3. **RLS is your friend** - All tables have RLS enabled for security
4. **Environment variables** - Use different keys for development and production

## Production Setup

When deploying to production:

1. Create a new Supabase project for production
2. Run the schema in the production project
3. Update production environment variables in your hosting platform
4. Update Site URL in Supabase Auth settings to your production domain
5. Configure production redirect URLs

