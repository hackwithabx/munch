# Munch

Searchable digital identity card platform built with Next.js + Supabase.

## Project Location

All application code is inside this folder: [munch](.).

## 1) Environment Setup

Create `.env.local` in this folder using [munch/.env.example](.env.example):

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
OPENAI_API_KEY=YOUR_OPENAI_API_KEY
```

`OPENAI_API_KEY` is optional, but required if you want the dashboard "Write Bio with AI" button to generate bios.

## 2) Supabase SQL Migration

Run the full migration from [munch/supabase/migrations/0001_munch_init.sql](supabase/migrations/0001_munch_init.sql) in your Supabase SQL Editor.

This migration creates:
- `profiles`
- `social_links`
- `page_views`
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

## 4) Main App Routes

- `/` search homepage
- `/[username]` public card
- `/login`, `/signup`
- `/dashboard`
- `/dashboard/analytics`

## 5) API Routes

- `/api/search`
- `/api/surprise`
- `/api/track-view`

## Notes

- Payment fields are display-only and do not process transactions.
- The app currently uses Next.js middleware file convention at [munch/middleware.ts](middleware.ts). Next.js 16 warns this will migrate to proxy in future versions.
