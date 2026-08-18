create table if not exists public.link_clicks (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references public.profiles(id) on delete cascade not null,
  social_link_id uuid references public.social_links(id) on delete set null,
  platform text not null,
  url text not null,
  clicked_at timestamptz not null default now(),
  referrer text,
  user_agent text
);

create index if not exists link_clicks_profile_id_idx on public.link_clicks(profile_id);
create index if not exists link_clicks_clicked_at_idx on public.link_clicks(clicked_at);
create index if not exists link_clicks_social_link_id_idx on public.link_clicks(social_link_id);

alter table public.link_clicks enable row level security;

create policy "Anyone can insert a link click"
  on public.link_clicks for insert with check (true);

create policy "Owners can view their own link analytics"
  on public.link_clicks for select using (auth.uid() = profile_id);
