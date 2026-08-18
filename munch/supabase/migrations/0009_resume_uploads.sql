alter table public.profiles
  add column if not exists resume_url text,
  add column if not exists resume_filename text;

insert into storage.buckets (id, name, public)
values ('resumes', 'resumes', true)
on conflict (id) do nothing;

drop policy if exists "Resume files are publicly accessible" on storage.objects;
create policy "Resume files are publicly accessible"
  on storage.objects for select using (bucket_id = 'resumes');

drop policy if exists "Users can upload their own resume" on storage.objects;
create policy "Users can upload their own resume"
  on storage.objects for insert with check (bucket_id = 'resumes' and auth.uid()::text = (storage.foldername(name))[1]);

drop policy if exists "Users can update their own resume" on storage.objects;
create policy "Users can update their own resume"
  on storage.objects for update using (bucket_id = 'resumes' and auth.uid()::text = (storage.foldername(name))[1]);
