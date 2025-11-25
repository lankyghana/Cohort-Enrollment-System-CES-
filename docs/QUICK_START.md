# Quick Start Guide

Get up and running with the Cohort Enrollment Platform in 5 minutes.

## Prerequisites

- Node.js 18+
- Laravel backend (running)
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
VITE_API_BASE_URL=http://localhost:8000
VITE_PAYSTACK_PUBLIC_KEY=your_paystack_key
```

### 3. Set Up Database

1. Go to your Laravel project's database
2. In the `users` table, change your user's `role` to `admin`

### 4. Create Admin User

1. Run the app: `npm run dev`
2. Register at `http://localhost:5173/register`
3. In your Laravel project's database, go to the `users` table
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

**"Missing API environment variables"**
→ Check your `.env` file exists and has correct values

**"Connection refused"**
→ Make sure your Laravel backend is running

**Cannot access admin routes**
→ Verify your user role is set to `admin` in the database

For more help, see [Setup Guide](./SETUP.md#troubleshooting)

