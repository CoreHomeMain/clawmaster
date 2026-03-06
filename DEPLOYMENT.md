# ClawMaster Deployment Guide

## Overview

ClawMaster is deployed on Vercel using SvelteKit with the Vercel adapter. This guide covers all steps needed to deploy to production.

## Prerequisites

Before deploying, ensure you have:
- [Vercel account](https://vercel.com/signup) (free tier works)
- [Supabase project](https://supabase.com) set up with all tables and migrations
- [PayPal developer account](https://developer.paypal.com) with API credentials
- [OpenRouter API key](https://openrouter.ai) for ClawBot AI
- Custom domain: `clawmaster.io` (or your domain)
- Git repository on GitHub, GitLab, or Bitbucket

## Architecture

- **Framework**: SvelteKit with Vercel adapter
- **Frontend**: Svelte 5 + TailwindCSS
- **Backend**: Node.js server runtime
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth (JWT)
- **Payments**: PayPal REST API
- **AI**: OpenRouter (Minimax model for ClawBot)

## Pre-Deployment Checklist

Before running deployment, verify:

- [ ] All environment variables are ready (see `.env.example`)
- [ ] Supabase database migrations are complete
- [ ] Supabase Row-Level Security (RLS) policies are enabled on all tables
- [ ] PayPal credentials are in live mode (not sandbox)
- [ ] OpenRouter account has sufficient credits
- [ ] Custom domain DNS records are prepared
- [ ] Build succeeds locally: `npm run build`
- [ ] All tests pass: `npm test`

## Build Status

**Note:** The current build has the following issues to resolve before production:

1. **Dependency conflict in npm**: There's a peer dependency conflict with `@sveltejs/vite-plugin-svelte-inspector`. Use `--legacy-peer-deps` flag if needed:
   ```bash
   npm install --legacy-peer-deps
   ```

2. **Minor Svelte warnings** (non-blocking):
   - Unused `data` export in some page components
   - Missing label association in Discord config form
   - These don't prevent deployment but should be fixed for best practices

3. **CSS Animation fix applied**: Fixed CSS syntax in `AchievementNotification.svelte` component

Run the pre-deployment check:
```bash
./scripts/pre-deploy-check.sh
```

## Step-by-Step Deployment

### 1. Install Vercel CLI

```bash
npm i -g vercel
```

Or use `npx`:
```bash
npx vercel@latest
```

### 2. Link Project to Vercel

```bash
cd /path/to/clawmaster
vercel link
```

Follow the prompts:
- Create new project
- Project name: `clawmaster`
- Framework preset: `SvelteKit`
- Root directory: `./` (default)

### 3. Set Environment Variables

Set all variables from `.env.example` in the Vercel dashboard or via CLI.

**Via CLI (recommended for sensitive values):**
```bash
vercel env add PUBLIC_SUPABASE_URL production
vercel env add PUBLIC_SUPABASE_ANON_KEY production
vercel env add SUPABASE_URL production
vercel env add SUPABASE_SERVICE_ROLE_KEY production
vercel env add PAYPAL_CLIENT_ID production
vercel env add PAYPAL_CLIENT_SECRET production
vercel env add PUBLIC_PAYPAL_CLIENT_ID production
vercel env add OPENROUTER_API_KEY production
vercel env add PUBLIC_APP_URL production
```

**Via Dashboard:**
1. Go to Vercel Dashboard → Project Settings → Environment Variables
2. Add each variable for Production environment
3. Click "Save"

### 4. Configure Supabase for Production

1. In Supabase dashboard:
   - Go to Project Settings → API
   - Add `https://clawmaster.io` to allowed origins
   - Enable RLS on all tables
   - Verify migrations are applied

2. Run database migrations:
   ```bash
   supabase db push
   ```

3. Verify RLS policies are enabled on these tables:
   - `user_profiles` - Users can only read/modify their own profile
   - `conversations` - Users can only see their own conversations
   - `messages` - Users can only see messages in their conversations
   - `achievements` - Users can read all, only own achievements can be updated
   - Any other tables per your schema

### 5. Deploy to Production

```bash
# Preview deployment (test before prod)
vercel preview

# Production deployment
vercel --prod
```

On first `vercel --prod`:
- Vercel will ask to confirm deployment to production
- Build logs will show in real-time
- Once complete, you'll get a production URL

### 6. Configure Custom Domain

1. In Vercel dashboard:
   - Go to Project → Settings → Domains
   - Click "Add Domain"
   - Enter: `clawmaster.io`

2. Update DNS records at your domain registrar:
   - Add CNAME record: `clawmaster.io` → `cname.vercel.sh`
   - Or add A records as shown in Vercel dashboard
   - Wait for DNS propagation (5-48 hours)

3. Verify in Vercel:
   - Once DNS is live, Vercel will automatically issue SSL certificate
   - Status should show "Valid Configuration"

### 7. PayPal Production Setup

1. In PayPal Developer Dashboard:
   - Switch from Sandbox to Live mode
   - Get live API credentials
   - Update `PAYPAL_CLIENT_ID` and `PAYPAL_CLIENT_SECRET` in Vercel

2. Update payment endpoints to use live URL:
   - Change `PAYPAL_BASE_URL` in `/src/routes/api/payments/create-order/+server.ts`
   - From: `https://api-m.sandbox.paypal.com`
   - To: `https://api-m.paypal.com`

3. Test payment flow in staging before going live

### 8. Smoke Tests

After deployment, verify all features work:

- [ ] Homepage loads and shows content
- [ ] User registration flow works
- [ ] Email verification sends correctly
- [ ] Login works with email/password
- [ ] Dashboard shows user data
- [ ] Learn modules display content
- [ ] Achievements unlock and display correctly
- [ ] ClawBot chat responds with AI
- [ ] PayPal checkout flow completes
- [ ] Configuration page works (channels, gateway)
- [ ] Profile settings save correctly
- [ ] User can logout

### 9. Enable Monitoring

1. **Vercel Analytics:**
   - Dashboard → Analytics → Enable Web Analytics
   - View Core Web Vitals

2. **Error Tracking:**
   - Vercel automatically logs errors
   - View in: Project → Monitoring → Logs

3. **Log View:**
   ```bash
   vercel logs
   ```

## Post-Deployment

### Monitor Performance
- Check Vercel Analytics for Core Web Vitals
- Monitor API response times
- Review error logs regularly

### Database Backups
- Supabase automatically backs up daily
- Configure backup retention in Supabase settings
- Test restore procedures monthly

### Security
- Enable 2FA on Vercel account
- Enable 2FA on Supabase account
- Rotate API keys every 90 days
- Monitor for suspicious activity in logs

### Updates & Maintenance
- Keep dependencies updated: `npm update`
- Review security advisories: `npm audit`
- Test updates in preview deployment before promoting to production

## Rollback Procedure

If deployment has issues:

1. **Via Vercel Dashboard:**
   - Go to Deployments tab
   - Find previous working deployment
   - Click three dots → "Promote to Production"

2. **Via CLI:**
   ```bash
   vercel deployments
   # Find the working deployment ID
   vercel promote <deployment-id>
   ```

## Environment Variable Reference

| Variable | Source | Required | Used For |
|----------|--------|----------|----------|
| `PUBLIC_SUPABASE_URL` | Supabase | Yes | Database and auth endpoint |
| `PUBLIC_SUPABASE_ANON_KEY` | Supabase | Yes | Client-side auth |
| `SUPABASE_URL` | Supabase | Yes | Server-side DB access |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase | Yes | Admin operations |
| `PAYPAL_CLIENT_ID` | PayPal | Yes | Payment processing |
| `PAYPAL_CLIENT_SECRET` | PayPal | Yes | Payment server calls |
| `PUBLIC_PAYPAL_CLIENT_ID` | PayPal | Yes | Frontend checkout |
| `OPENROUTER_API_KEY` | OpenRouter | Yes | ClawBot AI responses |
| `PUBLIC_APP_URL` | Custom | Yes | PayPal return URLs, email links |
| `NODE_ENV` | Manual | Yes | Set to `production` |

## Troubleshooting

### Build Fails with Dependency Errors
```bash
npm install --legacy-peer-deps
npm run build
```

### Environment Variables Not Loading
- Verify variables are set for "Production" environment in Vercel
- Check variable names match exactly (case-sensitive)
- Redeploy after changing variables

### Database Connection Errors
- Verify Supabase credentials are correct
- Check that allowed origins includes your Vercel URL
- Ensure database is online in Supabase dashboard

### PayPal Errors (401, 403)
- Verify credentials are for live mode (not sandbox)
- Check that URLs are correct for live API
- Verify IP whitelist if configured

### AI Chat Returns Errors
- Check OpenRouter API key is valid
- Verify account has sufficient credits
- Check rate limits: https://openrouter.ai/usage

### SSL Certificate Issues
- Custom domain must be properly configured
- Vercel takes up to 24 hours to issue certificate
- Force refresh in dashboard if stuck

## Support

For issues:
1. Check Vercel logs: `vercel logs`
2. Check Supabase logs: Supabase dashboard → Logs
3. Review error in browser console (F12)
4. Check this guide's troubleshooting section
5. Contact support:
   - Vercel: https://vercel.com/support
   - Supabase: https://supabase.com/support
   - PayPal: https://developer.paypal.com/support

## Additional Resources

- [SvelteKit Docs](https://kit.svelte.dev)
- [Vercel Docs](https://vercel.com/docs)
- [Supabase Docs](https://supabase.com/docs)
- [PayPal API Docs](https://developer.paypal.com/api/overview)
- [OpenRouter Docs](https://openrouter.io/docs)
