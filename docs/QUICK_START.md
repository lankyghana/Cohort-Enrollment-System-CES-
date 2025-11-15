# Quick Start Guide

Get up and running with the Cohort Enrollment Platform in 5 minutes.

## Prerequisites

- Node.js 18+
- Supabase account
- Paystack account (for payments)

## Quick Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment Variables

Copy `env.example` to `.env` and fill in your credentials:

```bash
cp env.example .env
```

Edit `.env`:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_key
VITE_PAYSTACK_PUBLIC_KEY=your_paystack_key
```

### 3. Set Up Database

1. Go to Supabase Dashboard → SQL Editor
2. Copy contents of `supabase/schema.sql`
3. Paste and run in SQL Editor

### 4. Create Admin User

1. Run the app: `npm run dev`
2. Register at `http://localhost:5173/register`
3. In Supabase → Table Editor → users
4. Change your user's `role` to `admin`

### 5. Start Development

```bash
npm run dev
```

Visit `http://localhost:5173`

## Next Steps

- Read [Full Setup Guide](./SETUP.md) for detailed instructions
- Review [Architecture](./ARCHITECTURE.md) to understand the system
- Check [Development Guidelines](./DEVELOPMENT.md) for coding standards

## Common Commands

```bash
# Development
npm run dev          # Start dev server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run linter

# Type checking
npx tsc --noEmit     # Check TypeScript types
```

## Troubleshooting

**"Missing Supabase environment variables"**
→ Check your `.env` file exists and has correct values

**"RLS policy violation"**
→ Make sure you ran the complete `schema.sql` file

**Cannot access admin routes**
→ Verify your user role is set to `admin` in the database

For more help, see [Setup Guide](./SETUP.md#troubleshooting)

