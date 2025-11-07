-- 006_remove_full_name_keep_username_only.sql
-- Migration: Remove full_name column and use username as the primary display name
-- Run this in Supabase SQL Editor

-- Step 1: Copy full_name data to username for users who don't have username yet
UPDATE public.profiles
SET username = full_name
WHERE username IS NULL AND full_name IS NOT NULL;

-- Step 2: Generate random username for users who have neither username nor full_name
UPDATE public.profiles
SET username = 'user_' || substr(md5(random()::text), 1, 8)
WHERE username IS NULL;

-- Step 3: Make username NOT NULL (required field)
ALTER TABLE public.profiles
ALTER COLUMN username SET NOT NULL;

-- Step 4: Drop full_name column
ALTER TABLE public.profiles
DROP COLUMN IF EXISTS full_name;

-- Step 5: Add comment to username column
COMMENT ON COLUMN public.profiles.username IS 'Primary display name and unique identifier for the user';
