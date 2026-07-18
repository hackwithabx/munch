alter table public.profiles
  add column if not exists contact_email text,
  add column if not exists phone_number text,
  add column if not exists show_email_public boolean default false,
  add column if not exists show_phone_public boolean default false;
