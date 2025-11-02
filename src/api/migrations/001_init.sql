-- 001_init.sql
-- Run this on your hosted Supabase project's SQL editor (SQL > New query)

-- Enable uuid generation (pgcrypto)
create extension if not exists "pgcrypto";

-- Profiles table: one row per auth user (id == auth.users.id)
create table if not exists public.profiles (
  id uuid not null primary key references auth.users(id) on delete cascade,
  username text,
  full_name text,
  bio text,
  gender text,
  birthdate date,
  phone text,
  avatar_url text,
  -- Human-readable address for display + coordinates for queries
  address text,
  -- Use double precision for latitude/longitude (more common for GPS coords)
  latitude double precision,
  longitude double precision,
  created_at timestamptz default now()
);

create unique index if not exists idx_profiles_username on public.profiles (username);

-- Photos for profiles (order allows reordering)
create table if not exists public.photos (
  id uuid default gen_random_uuid() primary key,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  url text not null,
  "order" int default 0,
  created_at timestamptz default now()
);
-- Example: add any indexes you need (search by username or created_at)
create index if not exists idx_profiles_created_at on public.profiles (created_at desc);
