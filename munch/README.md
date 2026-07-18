# Munch

Searchable digital identity card platform built with Next.js + Supabase.

## Project Location

All application code is inside this folder: [munch](.).

## 1) Environment Setup

Create `.env.local` in this folder using [munch/.env.example](.env.example):

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=YOUR_SUPABASE_SERVICE_ROLE_KEY
OPENAI_API_KEY=YOUR_OPENAI_API_KEY
DUMMY_CARD_COUNT=50
```

`OPENAI_API_KEY` is optional, but required if you want the dashboard "Write Bio with AI" button to generate bios.
`SUPABASE_SERVICE_ROLE_KEY` is only needed for the dummy seeding script and must never be exposed to the browser.

## 2) Supabase SQL Migration

Run the full migration from [munch/supabase/migrations/0001_munch_init.sql](supabase/migrations/0001_munch_init.sql) in your Supabase SQL Editor.

Then run these migrations as well:
- [munch/supabase/migrations/0002_search_insights.sql](supabase/migrations/0002_search_insights.sql)
- [munch/supabase/migrations/0003_public_contact_fields.sql](supabase/migrations/0003_public_contact_fields.sql)

This migration creates:
- `profiles`
- `social_links`
- `page_views`
- `search_queries` (via 0002)
- public contact fields on `profiles` (via 0003)
- RLS policies
- signup trigger + view-count trigger
- storage buckets + storage policies

## 3) Install and Run

From this folder:

```bash
npm install
npm run dev
```

Production checks:

```bash
npm run lint
npm run build
```

Seed 50 dummy cards (admin operation):

```bash
npm run seed:dummy
```

## 4) Main App Routes

- `/` search homepage
- `/[username]` public card
- `/login`, `/signup`
- `/dashboard`
- `/dashboard/analytics`
- `/trending`

## 5) API Routes

- `/api/search`
- `/api/surprise`
- `/api/log-search`
- `/api/track-view`
- `/api/generate-bio`

## Notes

- Payment fields are display-only and do not process transactions.
- Route protection uses [munch/proxy.ts](proxy.ts).
