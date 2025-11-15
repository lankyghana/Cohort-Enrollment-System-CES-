# Deployment Guide

This guide covers deploying the Cohort Enrollment Platform to production.

## Prerequisites

- Completed development setup
- Production Supabase project
- Production Paystack account
- Vercel account (or alternative hosting)
- Domain name (optional but recommended)

## Pre-Deployment Checklist

- [ ] All environment variables configured
- [ ] Database schema deployed to production Supabase
- [ ] RLS policies tested and verified
- [ ] Payment integration tested with Paystack test mode
- [ ] Email templates configured in Supabase
- [ ] Admin user created
- [ ] SSL certificate configured
- [ ] Error tracking set up (Sentry, etc.)

## Step 1: Set Up Production Supabase

### 1.1 Create Production Project

1. Create a new Supabase project for production
2. Note down the project URL and anon key
3. Run the database schema from `supabase/schema.sql`

### 1.2 Configure Authentication

1. Go to **Authentication** → **Settings**
2. Set **Site URL** to your production domain
3. Add production redirect URLs
4. Configure email templates
5. Enable email verification

### 1.3 Set Up Storage Buckets

1. Go to **Storage**
2. Create buckets:
   - `course-resources` - For course materials
   - `certificates` - For generated certificates
   - `avatars` - For user profile pictures
3. Configure bucket policies (public/private as needed)

## Step 2: Configure Paystack Production

1. Complete Paystack account verification
2. Get production API keys
3. Configure webhook URL: `https://your-supabase-project.supabase.co/functions/v1/paystack-webhook`
4. Test webhook integration

## Step 3: Deploy to Vercel

### 3.1 Connect Repository

1. Push code to GitHub/GitLab/Bitbucket
2. Go to [Vercel Dashboard](https://vercel.com)
3. Click "New Project"
4. Import your repository

### 3.2 Configure Build Settings

- **Framework Preset:** Vite
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Install Command:** `npm install`

### 3.3 Set Environment Variables

Add the following in Vercel dashboard:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_production_anon_key
VITE_PAYSTACK_PUBLIC_KEY=pk_live_your_production_key
VITE_APP_URL=https://yourdomain.com
VITE_APP_NAME=Cohort Enrollment Platform
NODE_ENV=production
```

### 3.4 Deploy

1. Click "Deploy"
2. Wait for build to complete
3. Verify deployment at the provided URL

## Step 4: Configure Custom Domain (Optional)

1. In Vercel dashboard, go to **Settings** → **Domains**
2. Add your custom domain
3. Configure DNS records as instructed
4. Wait for SSL certificate provisioning (automatic)

## Step 5: Set Up Monitoring

### 5.1 Error Tracking (Sentry)

1. Create Sentry account
2. Install Sentry SDK:
   ```bash
   npm install @sentry/react
   ```
3. Configure in `main.tsx`:
   ```typescript
   import * as Sentry from "@sentry/react"
   
   Sentry.init({
     dsn: "your-sentry-dsn",
     environment: "production",
   })
   ```

### 5.2 Analytics

- Set up Google Analytics or similar
- Configure in `index.html` or via environment variables

### 5.3 Uptime Monitoring

- Use Uptime Robot or similar service
- Monitor your production URL
- Set up alerts for downtime

## Step 6: Post-Deployment Verification

### 6.1 Test Critical Flows

- [ ] User registration
- [ ] Email verification
- [ ] User login
- [ ] Course enrollment
- [ ] Payment processing
- [ ] Admin dashboard access
- [ ] File uploads
- [ ] Certificate generation

### 6.2 Performance Testing

- [ ] Page load times
- [ ] API response times
- [ ] Image loading
- [ ] Database query performance

### 6.3 Security Verification

- [ ] HTTPS enabled
- [ ] RLS policies working
- [ ] Environment variables not exposed
- [ ] CORS configured correctly
- [ ] Rate limiting (if applicable)

## Step 7: Set Up CI/CD

The project includes GitHub Actions workflows:

- **CI Workflow** (`ci.yml`) - Runs on every PR
- **Deploy Workflow** (`deploy.yml`) - Deploys on merge to main

### Configure GitHub Secrets

Add the following secrets in GitHub repository settings:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_PAYSTACK_PUBLIC_KEY`
- `VITE_APP_URL`
- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`

## Environment-Specific Configuration

### Development

```env
VITE_APP_URL=http://localhost:5173
NODE_ENV=development
```

### Staging

```env
VITE_APP_URL=https://staging.yourdomain.com
NODE_ENV=production
```

### Production

```env
VITE_APP_URL=https://yourdomain.com
NODE_ENV=production
```

## Rollback Procedure

If deployment fails:

1. Go to Vercel dashboard
2. Navigate to **Deployments**
3. Find the last working deployment
4. Click "..." → "Promote to Production"

## Backup Strategy

### Database Backups

- Supabase provides automatic daily backups
- Manual backups can be created via Supabase dashboard
- Export schema regularly: `pg_dump` or Supabase CLI

### Code Backups

- Git repository serves as code backup
- Tag releases: `git tag v1.0.0 && git push --tags`

## Maintenance

### Regular Tasks

- Monitor error logs weekly
- Review performance metrics monthly
- Update dependencies quarterly
- Security audit annually

### Updates

1. Test updates in development
2. Deploy to staging
3. Verify functionality
4. Deploy to production
5. Monitor for issues

## Troubleshooting

### Build Fails

- Check build logs in Vercel
- Verify all environment variables are set
- Ensure dependencies are compatible

### Runtime Errors

- Check browser console
- Review Supabase logs
- Check Sentry for error reports

### Performance Issues

- Review Vercel analytics
- Check database query performance
- Optimize images and assets
- Enable caching where appropriate

## Support

For deployment issues:
1. Check Vercel documentation
2. Review Supabase status page
3. Check project logs
4. Contact support if needed

