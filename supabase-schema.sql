-- ============================================
-- Supabase Schema Setup
-- วิธีใช้: คัดลอกไปรันใน Supabase SQL Editor
-- Dashboard → SQL Editor → New query → Paste → Run
-- ============================================

-- 1. Profiles table (extends auth.users)
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  email text,
  display_name text,
  avatar_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Auto-create profile when user signs up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 2. Notes table (ตัวอย่าง CRUD)
create table if not exists public.notes (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  content text not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Index for faster queries
create index if not exists notes_user_id_idx on public.notes(user_id);

-- ============================================
-- Row Level Security (RLS) — สำคัญมาก!
-- ============================================

-- Profiles: users can only see/edit their own profile
alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Notes: users can only CRUD their own notes
alter table public.notes enable row level security;

create policy "Users can view own notes"
  on public.notes for select
  using (auth.uid() = user_id);

create policy "Users can insert own notes"
  on public.notes for insert
  with check (auth.uid() = user_id);

create policy "Users can update own notes"
  on public.notes for update
  using (auth.uid() = user_id);

create policy "Users can delete own notes"
  on public.notes for delete
  using (auth.uid() = user_id);

-- ============================================
-- Storage Bucket Setup
-- ============================================

-- Create 'uploads' bucket (public)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'uploads',
  'uploads',
  true,
  5242880, -- 5MB limit
  array['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf', 'text/plain']
)
on conflict (id) do nothing;

-- Storage policies: users can manage their own files (stored under their user_id folder)
create policy "Users can upload own files"
  on storage.objects for insert
  with check (
    bucket_id = 'uploads' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can view own files"
  on storage.objects for select
  using (
    bucket_id = 'uploads' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Public can view uploaded files"
  on storage.objects for select
  using (bucket_id = 'uploads');

create policy "Users can delete own files"
  on storage.objects for delete
  using (
    bucket_id = 'uploads' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Done!
select 'Schema setup complete!' as status;
