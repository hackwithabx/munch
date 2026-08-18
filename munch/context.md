# Munch Context

This file is the single source of truth for understanding and continuing development of Munch with any model/agent.

## 1) Product Summary

Munch is a searchable digital identity card platform.

Core idea:
- Users create a public profile card (like a modern digital visiting card).
- Anyone can search people by name, username, city, bio text, and free-form tags.
- Public cards are viewable at `/{username}`.

Primary UX:
- Homepage feels like a people-focused search engine.
- Dashboard lets users edit profile fields, links, visibility, avatar, and payment-display details.
- Public card is mobile-first and supports contact export and card QR download.

## 2) Tech Stack

- Frontend: Next.js App Router, React, TypeScript, Tailwind CSS
- Backend: Supabase (Auth, Postgres, Storage)
- Runtime: Node.js
- Deployment target: Vercel

## 3) Current Workspace Layout

Important note:
- App code is inside the `munch/` subfolder.
- Parent folder also contains unrelated content and historical moved files.

Main application paths:
- `munch/app/`
- `munch/components/`
- `munch/lib/`
- `munch/supabase/migrations/`
- `munch/proxy.ts`
- `munch/.env.local`

## 4) Environment Variables

Required for core app:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Optional for AI bio generation:
- `OPENAI_API_KEY`

Required for admin seeding script:
- `SUPABASE_SERVICE_ROLE_KEY`

## 5) Current Status (August 18, 2026)

### ✅ Live & Working
- Production URL: [https://munch-murex.vercel.app](https://munch-murex.vercel.app)
- Supabase properly configured with valid credentials
- Auth (signup/login) functional
- Dev server running at http://localhost:3000
- All 21 routes generating successfully on Vercel
- Monorepo Vercel config working correctly

### Recent Fixes
- Fixed Vercel monorepo configuration (app code in `munch/` subfolder)
- Updated to Next.js 16.2.10 with Turbopack
- Fixed OpenAI API calls (deprecated endpoint → chat completions)
- Supabase environment variables synced to Vercel production/preview
- Dev server with proper hot-reload and environment loading

### Database Schema
Full Postgres schema deployed via migrations:
- User profiles with searchable fields
- Social links with verification
- Page view tracking
- Search query logging
- Storage buckets for avatars and resumes
- RLS policies for data security
- Auth triggers for user lifecycle

## 6) Key Files Reference

**Frontend (User-facing):**
- `app/page.tsx` - Homepage with search
- `app/[username]/page.tsx` - Public profile card
- `app/(auth)/login/page.tsx`, `app/(auth)/signup/page.tsx` - Auth pages
- `app/dashboard/page.tsx` - User profile editor
- `components/AuthForm.tsx` - Signup/login form

**Backend (API & Logic):**
- `app/api/search/route.ts` - Search endpoint
- `app/api/generate-bio/route.ts` - AI bio generation
- `lib/supabase/client.ts` - Browser Supabase client
- `lib/supabase/server.ts` - Server-side Supabase client
- `proxy.ts` - Route protection middleware

**Database:**
- `supabase/migrations/0001_munch_init.sql` - Core schema
- `supabase/migrations/000X_*.sql` - Feature-specific schemas

## 7) Deployment Targets

**Production:** Vercel
- Automatic deploys from `main` branch
- Environment variables via Vercel dashboard
- Edge Functions for middleware/proxy
- Serverless functions for API routes

**Local:** Next.js dev server
- Hot reload enabled
- Turbopack compilation
- Same environment variables as production
- optional `DUMMY_CARD_COUNT`

Files:
- `.env.example`
- `.env.local.example`
- `.env.local`

## 5) Database Migrations

### 0001_munch_init.sql
Path:
- `munch/supabase/migrations/0001_munch_init.sql`

Creates:
- `profiles`
- `social_links`
- `page_views`
- indexes, RLS policies, triggers
- storage buckets: `avatars`, `qrcodes`

### 0002_search_insights.sql
Path:
- `munch/supabase/migrations/0002_search_insights.sql`

Creates:
- `search_queries`
- indexes + RLS policies for search analytics

Purpose:
- power insights like top search terms / "people are searching for"

### 0003_public_contact_fields.sql
Path:
- `munch/supabase/migrations/0003_public_contact_fields.sql`

Creates:
- `profiles.contact_email`
- `profiles.phone_number`
- `profiles.show_email_public`
- `profiles.show_phone_public`

### 0004_social_link_verification.sql
Path:
- `munch/supabase/migrations/0004_social_link_verification.sql`

Creates:
- `social_links.verification_status`
- `social_links.verification_note`
- `social_links.verified_at`

Purpose:
- supports trust labels for social links (unverified, pending, verified)

### 0005_link_clicks.sql
Path:
- `munch/supabase/migrations/0005_link_clicks.sql`

Creates:
- `link_clicks` table for per-link click tracking
- indexes for profile/time/link lookups
- RLS policies for public insert + owner-only select

Purpose:
- enables real link performance analytics (top platforms, recent clicks, weekly totals)

### 0006_profile_chases.sql
Path:
- `munch/supabase/migrations/0006_profile_chases.sql`

Creates:
- `profile_chases` relationship table (chaser -> target)
- unique anti-duplicate constraint and no-self-chase rule
- indexes and RLS policies for chase lifecycle

Purpose:
- powers "Start Chasing" and "Drop Card" features and real `Chased By` counts

### 0007_chase_notes.sql
Path:
- `munch/supabase/migrations/0007_chase_notes.sql`

Creates:
- `chase_notes` table for private per-card notes for chased cards
- ownership-based RLS policies
- updated_at trigger

Purpose:
- lets users keep private context/reminders for cards they chase

## 6) Routes

Pages:
- `/` homepage search + surprise + trending + new user CTA
- `/login`
- `/signup`
- `/dashboard`
- `/dashboard/analytics`
- `/{username}` public profile card

API:
- `/api/search`
- `/api/surprise`
- `/api/track-view`
- `/api/log-search`
- `/api/generate-bio`

## 7) Implemented Features

Auth + profile:
- Email/password signup/login via Supabase Auth
- Protected dashboard via `proxy.ts`
- Username profile routing and public/private visibility

Homepage search engine behavior:
- Debounced search
- Right-side trending cards panel
- "Surprise Me" button
- Claim username CTA when no results and handle-like query
- "New to Munch? Make your Card" CTA
- Logged-in user quick actions on homepage (View Card, Go to Dashboard)

Public card:
- Avatar, bio, tags, city, social links
- Seen count badge (view_count) shown on card
- Chased By count badge (derived from `profile_chases`)
- Payment display section (display-only fields)
- Save Contact `.vcf`
- Download card URL QR
- View tracking ping
- Home navigation via Munch logo and Home button
- Optional public contact block (email/phone visibility toggles)
- Social link verification labels
- Start Chasing / Drop Card action for logged-in viewers (non-owner)

Analytics and insights:
- Owner-facing view counts
- Most seen cards (all-time)
- Trending cards (weekly)
- People are searching for (weekly)
- Interactive dashboard analytics UI (window toggle, trend graph, KPI cards, ranking sections)
- Real link-click analytics (weekly/all-time counts, top platforms, recent click feed)
- Dashboard list of cards user is currently chasing with drop controls
- Dashboard chasing notes with save/update/delete behavior

AI bio:
- Dashboard button: "Write Bio with AI"
- Uses OpenAI (`gpt-4o-mini`) when API key exists
- Template fallback if API key missing/fails

## 8) Design + UX Conventions

- White-first clean aesthetic
- Rounded cards and subtle shadows
- Brand logo component: `components/MunchLogo.tsx`
- Minimal dependencies, hand-built UI

## 9) Security + Data Handling Notes

- Payment fields are display-only; no gateway integration.
- `service_role` key must never be used in frontend env.
- Only `NEXT_PUBLIC_SUPABASE_ANON_KEY` belongs in browser env.
- If service role key was shared, rotate it in Supabase immediately.

## 10) Runbook

Install:
- `npm install`

Dev:
- `npm run dev`

Build:
- `npm run build`

Lint:
- `npm run lint`

Seed dummy cards (admin env required):
- `npm run seed:dummy`

From parent folder, use:
- `npm --prefix /Users/abhishektiwari/Munch/munch run dev`

## 11) Known Runtime Dependencies

- Supabase must be reachable and migrations applied.
- For AI mode, set `OPENAI_API_KEY`.
- If keys change, restart dev server.

## 12) Current State Snapshot

As of latest update:
- Build passes.
- Search/surprise/profile routes work with migrated DB.
- Insights logging endpoint is implemented; requires `0002_search_insights.sql` to be applied.
- Homepage sidebar now shows only trending cards and no sidebar metric tiles.
- Public card page shows seen/view count directly under username.

## 13) Update Policy For This File

When any code change is made, update this file in the same commit by adding:
- What changed
- Which files were touched
- Any migration/env impact
- Any new route/API/component

Append updates in a short changelog section below.

## 14) Changelog

### 2026-07-19
- Added AI bio generation endpoint and dashboard controls.
- Added template fallback when OpenAI key is missing/fails.
- Added homepage CTA: "New to Munch? Make your Card".
- Added home navigation options on public card page.
- Added insights stack (`search_queries`, log endpoint, homepage trending terms, analytics cards).
- Added migration `0002_search_insights.sql`.
- Migrated request gate from `middleware.ts` to `proxy.ts`.

### 2026-07-19 (latest)
- Made homepage Munch logo clickable to navigate to `/`.
- Added analytics capabilities for most-seen cards, trending cards, and top searched terms.
- Added API route `/api/log-search` and tracking table migration for search intent insights.
- Recorded Git commit for full app implementation and context documentation (`9def3bf`).
- Improved auth UX for Supabase rate-limit errors with explicit guidance during signup/login.
- Added homepage "Trending Now" strip powered by weekly page-view analytics.
- Added small green trending badges on profile cards for "Most Seen" and "Trending" markers.
- Added dedicated `/trending` page showing ranked weekly trending and most-seen cards.
- Made trend badges on cards clickable to navigate to `/trending`.
- Added explicit "Back to Home" action on signup/login screens.
- Added right-side boxed "Top 5 Trending Cards" sidebar in homepage search results view.

### 2026-07-19 (current)
- Added signup cooldown behavior: when rate-limited, form disables submit for 120s and shows countdown.
- Added dashboard controls for `contact_email`, `phone_number`, and public visibility toggles.
- Added public card contact section that only shows enabled public fields.
- Extended vCard export to include optional email/phone values.
- Added migration `0003_public_contact_fields.sql` for contact + visibility fields.
- Added admin seeding script `scripts/seedDummyCards.mjs` and npm command `seed:dummy`.
- Build passes after changes; seeding is blocked until `SUPABASE_SERVICE_ROLE_KEY` is configured in `.env.local`.

### 2026-07-19 (latest)
- Added migration `0004_social_link_verification.sql` for social link verification metadata.
- Added verification-aware social link rendering on public card and validation-aware social link editing in dashboard.
- Upgraded dashboard analytics area with a richer interactive UI component and improved dashboard shell styling.
- Homepage updates: removed horizontal/hero intro trending window, added logged-in identity shortcut, and refined right sidebar behavior.
- Homepage sidebar now shows only trending cards and removed Cards Matched/Cards Seen metric number tiles.
- Public profile card now visibly shows seen count as "Seen X times" after opening a card.
- Search UX remains vertical, paginated, and build-validated after all updates.
- Added `0005_link_clicks.sql` and API route `/api/track-link-click` for production link-click tracking.
- Public card links now send real click events via `TrackedExternalLink` before opening external URLs.
- Added Smart Links performance visibility in dashboard analytics (weekly clicks, all-time clicks, top platforms, recent link click log).
- Added `0006_profile_chases.sql` and API route `/api/chase` for production Start Chasing/Drop Card workflow.
- Public profile now supports Start Chasing and Drop Card for logged-in non-owners.
- Dashboard now includes "Cards You Are Chasing" list with drop actions.
- Semantics updated across card UI: `Chased By` is chase-count; `Seen` is view-count.
- Added mutual chase detection and indicator on public profiles.
- Added analytics conversion funnel: Seen / Chased / Clicked metrics and rates.
- Added `0007_chase_notes.sql` and API route `/api/chase-note` for private note-taking on chased cards.
