# Deployment Guide

This guide covers deploying the Cohort Enrollment Platform to production.

## Prerequisites

- Completed development setup
- Production Laravel backend
- Production Paystack account
- Vercel account (or alternative hosting)
- Domain name (optional but recommended)

## Pre-Deployment Checklist

- [ ] All environment variables configured
- [ ] Database migrations run on production database
- [ ] API endpoints tested and verified
- [ ] Payment integration tested with Paystack test mode
- [ ] Email transport configured in Laravel
- [ ] Admin user created
- [ ] SSL certificate configured
- [ ] Error tracking set up (Sentry, etc.)

## Step 1: Set Up Production Backend

### 1.1 Deploy Laravel Application

1. Deploy the Laravel application in the `backend` directory to your server (e.g., DigitalOcean, AWS).
2. Configure your web server (Nginx, Apache).
3. Set up a production database (MySQL, PostgreSQL).
4. Run the database migrations: `php artisan migrate --seed`.

### 1.2 Configure Backend

1. Set the `APP_URL` in your backend's `.env` file to your production domain.
2. Configure email settings, queue workers, and other production services.

## Step 2: Configure Paystack Production

1. Complete Paystack account verification
2. Get production API keys
3. Configure webhook URL in your Paystack dashboard to point to your Laravel backend's webhook route (e.g., `https://your-api.com/api/paystack/webhook`).
4. Test webhook integration.

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
VITE_API_BASE_URL=https://your-laravel-api-domain.com
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
- [ ] API endpoints responding correctly
- [ ] Database connections are stable
- [ ] File uploads (if applicable)
- [ ] Certificate generation

### 6.2 Performance Testing

- [ ] Page load times
- [ ] API response times
- [ ] Image loading
- [ ] Database query performance

### 6.3 Security Verification

- [ ] HTTPS enabled
- [ ] API authentication policies working
- [ ] Environment variables not exposed
- [ ] CORS configured correctly
- [ ] Rate limiting on API

## Step 7: Set Up CI/CD

The project includes GitHub Actions workflows:

- **CI Workflow** (`ci.yml`) - Runs on every PR
- **Deploy Workflow** (`deploy.yml`) - Deploys on merge to main

### Configure GitHub Secrets

Add the following secrets in GitHub repository settings for your backend repository:

- `DB_CONNECTION`, `DB_HOST`, etc.
- `PAYSTACK_SECRET_KEY`
- `SANCTUM_STATEFUL_DOMAINS`

For the frontend repository:
- `VITE_API_BASE_URL`
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

- Set up automatic daily backups for your production database.
- Manual backups can be created using `mysqldump` or `pg_dump`.
- Store backups in a secure, off-site location.

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

- Check server logs (Nginx, Laravel logs)
- Review Sentry for error reports

### Performance Issues

- Review Vercel analytics
- Check database query performance
- Optimize images and assets
- Enable caching where appropriate

## Support

For deployment issues:
1. Check Vercel documentation
2. Review server and application logs
3. Check project logs
4. Contact support if needed

