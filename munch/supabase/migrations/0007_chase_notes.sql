create table if not exists public.chase_notes (
  id uuid primary key default gen_random_uuid(),
  chaser_profile_id uuid references public.profiles(id) on delete cascade not null,
  target_profile_id uuid references public.profiles(id) on delete cascade not null,
  note text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint chase_notes_unique unique (chaser_profile_id, target_profile_id),
  constraint chase_notes_not_self check (chaser_profile_id <> target_profile_id)
);

create index if not exists chase_notes_chaser_idx on public.chase_notes(chaser_profile_id);
create index if not exists chase_notes_target_idx on public.chase_notes(target_profile_id);

alter table public.chase_notes enable row level security;

create policy "Users can read their own chase notes"
  on public.chase_notes for select using (auth.uid() = chaser_profile_id);

create policy "Users can upsert their own chase notes"
  on public.chase_notes for insert with check (auth.uid() = chaser_profile_id);

create policy "Users can update their own chase notes"
  on public.chase_notes for update using (auth.uid() = chaser_profile_id);

create policy "Users can delete their own chase notes"
  on public.chase_notes for delete using (auth.uid() = chaser_profile_id);

create or replace function public.set_chase_notes_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_chase_notes_updated_at_trigger on public.chase_notes;
create trigger set_chase_notes_updated_at_trigger
  before update on public.chase_notes
  for each row execute procedure public.set_chase_notes_updated_at();
