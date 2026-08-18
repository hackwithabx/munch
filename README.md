# Munch

**Munch** is a searchable digital identity card platform built with Next.js, React, TypeScript, Tailwind CSS, and Supabase.

## 🚀 Quick Links

- **Live App:** [https://munch-murex.vercel.app](https://munch-murex.vercel.app)
- **GitHub Repository:** [hackwithabx/munch](https://github.com/hackwithabx/munch)
- **App Code:** Inside the `munch/` folder (monorepo structure)

## 📋 Project Overview

**Munch** lets users:
- Create a searchable public profile card (like a digital visiting card)
- Search for people by name, username, skills, city, or tags
- View public cards at `/{username}`
- Manage their profile, links, avatar, and visibility from a dashboard

## 🏗️ Project Structure

This is a **monorepo** with application code in the `munch/` subfolder:

```
Munch/
├── munch/                    # Main app folder
│   ├── app/                  # Next.js App Router (pages, API routes)
│   ├── components/           # React components
│   ├── lib/                  # Utilities (Supabase client, types)
│   ├── supabase/migrations/  # Database schema
│   ├── .env.local            # Environment variables (local)
│   ├── package.json
│   └── next.config.ts
├── README.md                 # This file
└── AGENTS.md, CLAUDE.md      # AI agent configuration
```

## 🚀 Getting Started

### 1. Prerequisites

- Node.js 18+ (tested with 22.22.2)
- A Supabase project (free tier works)
- Vercel account (for deployment)

### 2. Local Development

```bash
cd munch
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Environment Configuration

Create `munch/.env.local` with:

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_KEY  # For admin operations only
OPENAI_API_KEY=YOUR_KEY  # Optional, for AI bio generation
```

Get these values from your Supabase Dashboard → Settings → API Keys.

### 4. Database Setup

Run the SQL migrations in your Supabase SQL Editor:

1. [munch/supabase/migrations/0001_munch_init.sql](munch/supabase/migrations/0001_munch_init.sql) - Core schema
2. [munch/supabase/migrations/0002_search_insights.sql](munch/supabase/migrations/0002_search_insights.sql) - Search analytics
3. [munch/supabase/migrations/0003_public_contact_fields.sql](munch/supabase/migrations/0003_public_contact_fields.sql) - Public profile fields

Plus additional migrations in the same directory for other features.

## 📚 Documentation

- **[DEPLOYMENT.md](munch/DEPLOYMENT.md)** - Complete Vercel deployment guide
- **[context.md](munch/context.md)** - Architecture and tech stack details
- **[munch/README.md](munch/README.md)** - App-specific setup and routes

## ✅ Current Status

✅ **Production:** Live at [https://munch-murex.vercel.app](https://munch-murex.vercel.app)  
✅ **Supabase:** Configured with valid credentials  
✅ **Auth:** Signup/login functional  
✅ **Dev Server:** Running locally at http://localhost:3000  
✅ **Build:** Vercel deployment stable

## 📦 Main Routes

- `/` - Search homepage
- `/[username]` - Public profile card
- `/login`, `/signup` - Authentication
- `/dashboard` - User profile editor
- `/dashboard/analytics` - View analytics
- `/trending` - Trending profiles
- `/about`, `/how-to-use`, `/privacy`, `/terms` - Info pages

## 🔌 API Endpoints

- `POST /api/search` - Search profiles
- `POST /api/surprise` - Random profile
- `POST /api/log-search` - Track searches
- `POST /api/track-view` - Track views
- `POST /api/generate-bio` - AI bio generation
- `POST /api/chase` - Profile chase/follow
- `POST /api/chase-note` - Chase notes

## 🛠️ Development Commands

```bash
npm run dev      # Start dev server
npm run build    # Production build
npm run lint     # Lint with ESLint
npm run seed:dummy   # Seed 50 test profiles
```

## 📝 Tech Stack

- **Frontend:** Next.js 16.2.10 (App Router), React 19, TypeScript, Tailwind CSS
- **Backend:** Supabase (PostgreSQL, Auth, Storage)
- **Deployment:** Vercel (serverless functions + static)
- **Runtime:** Node.js 22+ / Edge Functions

## 📄 Notes

- This is a **monorepo** with app code in `munch/`
- Vercel is configured to build from the `munch/` directory
- Environment variables must be set in both `.env.local` and Vercel dashboard
- Payment fields are display-only and do not process transactions
- Route protection is enforced via `munch/proxy.ts` middleware
