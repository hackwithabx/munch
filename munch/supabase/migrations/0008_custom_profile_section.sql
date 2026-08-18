alter table public.profiles
  add column if not exists custom_section_title text,
  add column if not exists custom_section_content text;
