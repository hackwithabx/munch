-- ============================================
-- EXTENSIONS (for fuzzy/fast search)
-- ============================================
create extension if not exists pg_trgm;

-- ============================================
-- TABLE: profiles
-- ============================================
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  username text unique not null check (char_length(username) >= 3 and username ~ '^[a-z0-9_]+$'),
  display_name text,
  bio text check (char_length(bio) <= 280),
  tags text[] default '{}',              -- free text, e.g. {"electrician","home repairs"} — no fixed taxonomy
  city text,                             -- plain text, e.g. "Pune" — NOT a GPS/geolocation field
  avatar_url text,
  qr_code_url text,                      -- user-uploaded image, display-only
  payment_label text,                    -- caption only, e.g. "Scan to pay via UPI"
  upi_id text,                           -- plain text, displayed as-is, never processed
  payment_link text,                     -- plain text (e.g. paypal.me/you), displayed as-is, never processed
  is_public boolean default true,
  view_count int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index profiles_username_trgm_idx on public.profiles using gin (username gin_trgm_ops);
create index profiles_display_name_trgm_idx on public.profiles using gin (display_name gin_trgm_ops);
create index profiles_bio_trgm_idx on public.profiles using gin (bio gin_trgm_ops);
create index profiles_tags_idx on public.profiles using gin (tags);

-- ============================================
-- TABLE: social_links
-- ============================================
create table public.social_links (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references public.profiles(id) on delete cascade not null,
  platform text not null,   -- 'instagram' | 'twitter' | 'github' | 'website' | 'linkedin' | 'youtube' etc.
  url text not null,
  display_order int default 0,
  created_at timestamptz default now()
);

create index social_links_profile_id_idx on public.social_links(profile_id);

-- ============================================
-- TABLE: page_views (simple owner-facing analytics)
-- ============================================
create table public.page_views (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references public.profiles(id) on delete cascade not null,
  viewed_at timestamptz default now(),
  referrer text
);

create index page_views_profile_id_idx on public.page_views(profile_id);
create index page_views_viewed_at_idx on public.page_views(viewed_at);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
alter table public.profiles enable row level security;
alter table public.social_links enable row level security;
alter table public.page_views enable row level security;

-- profiles: public can read public cards; owners can always read/write their own
create policy "Public profiles are viewable by everyone"
  on public.profiles for select using (is_public = true);

create policy "Users can view their own profile"
  on public.profiles for select using (auth.uid() = id);

create policy "Users can insert their own profile"
  on public.profiles for insert with check (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update using (auth.uid() = id);

create policy "Users can delete their own profile"
  on public.profiles for delete using (auth.uid() = id);

-- social_links: readable by everyone, writable only by the owning profile
create policy "Social links are viewable by everyone"
  on public.social_links for select using (true);

create policy "Users can insert their own links"
  on public.social_links for insert with check (auth.uid() = profile_id);

create policy "Users can update their own links"
  on public.social_links for update using (auth.uid() = profile_id);

create policy "Users can delete their own links"
  on public.social_links for delete using (auth.uid() = profile_id);

-- page_views: anyone (including anonymous visitors) can log a view; only the owner can read analytics
create policy "Anyone can insert a page view"
  on public.page_views for insert with check (true);

create policy "Owners can view their own analytics"
  on public.page_views for select using (auth.uid() = profile_id);

-- ============================================
-- AUTO-CREATE PROFILE ON SIGNUP
-- ============================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username, display_name)
  values (
    new.id,
    'user_' || substr(replace(new.id::text, '-', ''), 1, 8),
    coalesce(new.raw_user_meta_data->>'full_name', 'New User')
  );
  return new;
end;
$$ language plpgsql security definer set search_path = public;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================
-- AUTO-UPDATE updated_at
-- ============================================
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.set_updated_at();

-- ============================================
-- Auto-increment profiles.view_count when a page_view is logged
-- ============================================
create or replace function public.increment_view_count()
returns trigger as $$
begin
  update public.profiles set view_count = view_count + 1 where id = new.profile_id;
  return new;
end;
$$ language plpgsql security definer set search_path = public;

create trigger on_page_view_insert
  after insert on public.page_views
  for each row execute procedure public.increment_view_count();

-- ============================================
-- STORAGE BUCKETS (avatars + QR code images)
-- ============================================
insert into storage.buckets (id, name, public) values ('avatars', 'avatars', true);
insert into storage.buckets (id, name, public) values ('qrcodes', 'qrcodes', true);

create policy "Avatar images are publicly accessible"
  on storage.objects for select using (bucket_id = 'avatars');
create policy "Users can upload their own avatar"
  on storage.objects for insert with check (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);
create policy "Users can update their own avatar"
  on storage.objects for update using (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "QR images are publicly accessible"
  on storage.objects for select using (bucket_id = 'qrcodes');
create policy "Users can upload their own QR"
  on storage.objects for insert with check (bucket_id = 'qrcodes' and auth.uid()::text = (storage.foldername(name))[1]);
create policy "Users can update their own QR"
  on storage.objects for update using (bucket_id = 'qrcodes' and auth.uid()::text = (storage.foldername(name))[1]);
