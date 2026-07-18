-- ============================================
-- TABLE: search_queries (homepage search insights)
-- ============================================
create table if not exists public.search_queries (
  id uuid primary key default gen_random_uuid(),
  query_text text not null check (char_length(query_text) <= 100),
  normalized_query text not null check (char_length(normalized_query) <= 100),
  source text default 'homepage',
  searched_at timestamptz default now()
);

create index if not exists search_queries_normalized_idx
  on public.search_queries (normalized_query);

create index if not exists search_queries_searched_at_idx
  on public.search_queries (searched_at desc);

alter table public.search_queries enable row level security;

create policy "Anyone can insert search queries"
  on public.search_queries for insert with check (true);

create policy "Anyone can read search query analytics"
  on public.search_queries for select using (true);
