# Deployment Guide for Munch

This guide walks you through deploying Munch to Vercel for free.

## Prerequisites

- [GitHub](https://github.com) account
- [Vercel](https://vercel.com) account (free)
- [Supabase](https://supabase.com) project (already set up)

## Step 1: Prepare Your Code for GitHub

### Initialize Git (if not already done)

```bash
cd /Users/abhishektiwari/Munch
git init
git config user.name "Your Name"
git config user.email "your.email@example.com"
git add .
git commit -m "Initial commit: Munch digital identity card platform"
```

## Step 2: Create a GitHub Repository

1. Go to [github.com/new](https://github.com/new)
2. **Repository name:** `munch`
3. **Description:** "Searchable digital identity card platform built with Next.js + Supabase"
4. Select **Public** or **Private** (your preference)
5. **Do NOT** check "Initialize this repository with:" (you already have files)
6. Click **Create repository**

## Step 3: Push Code to GitHub

GitHub will show you commands. Run them:

```bash
git remote add origin https://github.com/YOUR_USERNAME/munch.git
git branch -M main
git push -u origin main
```

Replace `YOUR_USERNAME` with your GitHub username.

## Step 4: Deploy on Vercel

### Connect Vercel to GitHub

1. Go to [vercel.com](https://vercel.com)
2. Click **"New Project"**
3. Click **"Import Git Repository"**
4. Paste your GitHub repo URL: `https://github.com/YOUR_USERNAME/munch.git`
5. Click **Import**

### Configure the Project

On the "Configure Project" screen:

1. **Framework Preset:** Select "Next.js"
2. **Root Directory:** Click "Edit" and set to `munch/` (very important!)
3. **Build Command:** Should auto-fill as `next build`
4. **Output Directory:** Should auto-fill as `.next`

### Add Environment Variables

Scroll down to "Environment Variables" and add:

```
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_key_here
OPENAI_API_KEY=your_openai_key_here  (optional, for AI bio generation)
```

Get these values from:
- Supabase Dashboard → Settings → API Keys

### Deploy

Click **"Deploy"**

Your app will be live in **~2 minutes**! 🚀

Vercel will assign you a free URL like: `munch-abc123.vercel.app`

## Step 5: Verify Deployment

After deployment completes:

1. Click the project URL to visit your deployed app
2. Test the homepage search
3. Create an account and verify auth works
4. Check that Supabase is connected

## Environment Variables Reference

| Variable | Required | Source | Notes |
|----------|----------|--------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ Yes | Supabase Dashboard | Public, safe to expose |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ Yes | Supabase Dashboard | Public, safe to expose |
| `SUPABASE_SERVICE_ROLE_KEY` | ⚠️ Admin only | Supabase Dashboard | For seed script and admin operations. **Never expose to browser.** |
| `OPENAI_API_KEY` | ❌ Optional | OpenAI Platform | Enables AI bio generation on dashboard. Leave blank to disable. |

## ✅ Current Status

### Production
- **URL:** [https://munch-murex.vercel.app](https://munch-murex.vercel.app)
- **Status:** ✅ Live and working
- **Last Deploy:** August 18, 2026
- **Build:** Next.js 16.2.10 (Turbopack)
- **Supabase:** Connected and authenticated

### Features Verified
- ✅ Homepage loads without Supabase warning
- ✅ Signup page renders correctly
- ✅ Authentication with Supabase working
- ✅ Database schema deployed
- ✅ Search functionality ready
- ✅ All 21 routes generating correctly

## Troubleshooting

### "Supabase is not configured yet"
This warning means:
- Environment variables are not set in Vercel
- Or Supabase URL/anon key are invalid or stale

**Fix:** Update environment variables in Vercel project settings:
1. Go to [vercel.com](https://vercel.com) → Your Project → Settings → Environment Variables
2. Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Redeploy: `vercel deploy --prod --yes`

### "Failed to fetch" during signup
This error indicates:
- Invalid Supabase URL (DNS resolution failure)
- Network connectivity issue
- Supabase project down

**Fix:**
1. Verify Supabase project is active and accessible
2. Confirm `NEXT_PUBLIC_SUPABASE_URL` is correct in Vercel environment
3. Check that URL resolves: `curl -I https://YOUR_PROJECT.supabase.co`
4. Redeploy after fixing

### Local dev server won't start
```bash
# Make sure you're in the munch folder
cd munch

# Kill any existing processes
pkill -f "next dev"

# Clear cache and reinstall
rm -rf .next node_modules
npm install
npm run dev
```

## Next Steps

1. **Verify deployment:** Visit [https://munch-murex.vercel.app](https://munch-murex.vercel.app)
2. **Test signup:** Try creating an account
3. **Seed dummy data:** `npm run seed:dummy` (if needed)
4. **Monitor logs:** Use `vercel logs --environment production` to debug

## Additional Resources

- [Munch App README](./README.md) - App-specific documentation
- [Context & Architecture](./context.md) - Technical overview
- [Next.js 16 Docs](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Vercel Docs](https://vercel.com/docs)
| `SUPABASE_SERVICE_ROLE_KEY` | ❌ No | Supabase Dashboard | Only needed for dummy seeding |
| `OPENAI_API_KEY` | ❌ No | OpenAI Platform | Optional, for AI bio generation |

## After Deployment

### Redeploy After Code Changes

Any push to `main` branch will auto-redeploy:

```bash
git add .
git commit -m "Your changes"
git push origin main
```

Vercel will automatically rebuild and redeploy.

### Custom Domain (Optional)

Go to Vercel Project Settings → Domains and add your own domain.

### Monitoring

Vercel Dashboard shows:
- Deployment history
- Build logs
- Performance metrics
- Error tracking

## Troubleshooting

### Build Fails with "Root Directory" Error
- Ensure Root Directory is set to `munch/` (not `munch` without slash, and not `/`)

### 404 on Public Routes
- Check that Supabase migrations are applied
- Verify RLS policies are correct

### Env Variables Not Loaded
- Redeploy after adding variables (Vercel doesn't hot-reload env vars)
- Click "Redeploy" button in Vercel Dashboard

### Can't Sign Up / Auth Not Working
- Verify `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are correct
- Check Supabase Auth Settings → URL Configuration includes your Vercel domain

## Support

For issues:
- [Next.js Docs](https://nextjs.org/docs)
- [Vercel Docs](https://vercel.com/docs)
- [Supabase Docs](https://supabase.com/docs)
