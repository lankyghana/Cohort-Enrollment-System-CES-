# Supabase Setup Checklist

Use this checklist to ensure your Supabase setup is complete.

## ✅ Step 1: Get Credentials

- [ ] Opened Supabase Dashboard
- [ ] Navigated to Settings → API
- [ ] Copied Project URL (starts with `https://`)
- [ ] Copied anon/public key (starts with `eyJ`)
- [ ] Created `.env` file from `env.example`
- [ ] Added `VITE_SUPABASE_URL` to `.env`
- [ ] Added `VITE_SUPABASE_ANON_KEY` to `.env`

## ✅ Step 2: Database Schema

- [ ] Opened SQL Editor in Supabase
- [ ] Opened `supabase/schema.sql` file
- [ ] Copied entire contents
- [ ] Pasted into SQL Editor
- [ ] Clicked Run
- [ ] Verified no errors in SQL Editor
- [ ] Checked Table Editor - all 10 tables visible:
  - [ ] users
  - [ ] courses
  - [ ] course_modules
  - [ ] course_sessions
  - [ ] enrollments
  - [ ] payments
  - [ ] resources
  - [ ] certificates
  - [ ] announcements
  - [ ] messages

## ✅ Step 3: Authentication

- [ ] Went to Authentication → Settings
- [ ] Set Site URL to `http://localhost:5173`
- [ ] Added redirect URL: `http://localhost:5173/**`
- [ ] Verified Email provider is enabled
- [ ] (Optional) Customized email templates

## ✅ Step 4: Storage Buckets

- [ ] Created bucket: `course-resources`
- [ ] Created bucket: `certificates`
- [ ] Created bucket: `avatars`
- [ ] Set appropriate public/private settings

## ✅ Step 5: Test Connection

- [ ] Started dev server: `npm run dev`
- [ ] Opened `http://localhost:5173`
- [ ] Checked browser console - no Supabase errors
- [ ] Verified app loads without errors

## ✅ Step 6: Create Admin User

- [ ] Registered account at `/register`
- [ ] Verified email (checked inbox)
- [ ] Logged in successfully
- [ ] Updated user role to `admin` in Supabase
- [ ] Logged out and back in
- [ ] Accessed `/admin` route successfully

## 🎉 Setup Complete!

If all items are checked, your Supabase setup is complete!

## Quick Test Commands

Test your connection in the browser console:

```javascript
// Test Supabase connection
import { supabase } from './services/supabase'

// Test auth
const { data, error } = await supabase.auth.getSession()
console.log('Session:', data, error)

// Test database
const { data: courses, error: dbError } = await supabase
  .from('courses')
  .select('*')
  .limit(1)
console.log('Database:', courses, dbError)
```

## Common Issues

| Issue | Solution |
|-------|----------|
| "Missing Supabase environment variables" | Check `.env` file exists and has correct variable names |
| "Invalid API key" | Verify you copied the anon key, not service_role key |
| "RLS policy violation" | Make sure you ran the complete schema.sql |
| Tables not showing | Refresh Table Editor or check SQL Editor for errors |

## Need Help?

- See [Full Supabase Setup Guide](./SUPABASE_SETUP.md)
- Check [Troubleshooting Section](./SUPABASE_SETUP.md#troubleshooting)
- Review [Supabase Documentation](https://supabase.com/docs)

