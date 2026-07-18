alter table public.social_links
  add column if not exists verification_status text not null default 'unverified'
    check (verification_status in ('unverified', 'pending', 'verified')),
  add column if not exists verification_note text,
  add column if not exists verified_at timestamptz;
