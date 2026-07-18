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
- Empty-state trending sections
- "Surprise Me" button
- Claim username CTA when no results and handle-like query
- "New to Munch? Make your Card" CTA

Public card:
- Avatar, bio, tags, city, social links
- Payment display section (display-only fields)
- Save Contact `.vcf`
- Download card URL QR
- View tracking ping
- Home navigation via Munch logo and Home button

Analytics and insights:
- Owner-facing view counts
- Most seen cards (all-time)
- Trending cards (weekly)
- People are searching for (weekly)

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
