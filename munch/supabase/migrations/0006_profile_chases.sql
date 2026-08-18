create table if not exists public.profile_chases (
  id uuid primary key default gen_random_uuid(),
  chaser_profile_id uuid references public.profiles(id) on delete cascade not null,
  target_profile_id uuid references public.profiles(id) on delete cascade not null,
  created_at timestamptz not null default now(),
  constraint profile_chases_unique unique (chaser_profile_id, target_profile_id),
  constraint profile_chases_not_self check (chaser_profile_id <> target_profile_id)
);

create index if not exists profile_chases_chaser_idx on public.profile_chases(chaser_profile_id);
create index if not exists profile_chases_target_idx on public.profile_chases(target_profile_id);
create index if not exists profile_chases_created_at_idx on public.profile_chases(created_at);

alter table public.profile_chases enable row level security;

create policy "Profile chases are viewable for counts"
  on public.profile_chases for select using (true);

create policy "Users can start chasing from own profile"
  on public.profile_chases for insert with check (auth.uid() = chaser_profile_id);

create policy "Users can drop own chased cards"
  on public.profile_chases for delete using (auth.uid() = chaser_profile_id);
