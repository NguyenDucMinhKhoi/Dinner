-- 007_add_email_auth.sql
-- Migration: Add email column and switch from phone to email/password authentication
-- Run this in Supabase SQL Editor

-- Step 1: Add email column to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS email TEXT;

-- Step 2: Create unique index on email (for fast lookups and uniqueness)
CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles (email);

-- Step 3: Make phone nullable (no longer required, but keep for optional profile info)
ALTER TABLE public.profiles
ALTER COLUMN phone DROP NOT NULL;

-- Step 4: Add index on phone for optional lookups (if you want to search by phone later)
CREATE INDEX IF NOT EXISTS idx_profiles_phone ON public.profiles (phone);

-- Step 5: Add comment to email column
COMMENT ON COLUMN public.profiles.email IS 'Primary email address for authentication and communication';

-- Step 6: Add comment to phone column
COMMENT ON COLUMN public.profiles.phone IS 'Optional phone number for profile display and contact';

-- Step 7: Update RLS policies for better email auth flow
-- Fix INSERT policy to allow both authenticated users AND service role

-- Drop old INSERT policy
DROP POLICY IF EXISTS "Profiles: insert own profile" ON public.profiles;

-- New INSERT policy: Allow authenticated users OR service role
CREATE POLICY "Profiles: insert own or service" ON public.profiles
  FOR INSERT
  WITH CHECK (
    auth.uid() = id  -- Authenticated user creating own profile
    OR auth.jwt() ->> 'role' = 'service_role'  -- Or service role (backend)
  );

-- Existing policies that still work:
-- - "Profiles: public read all" - USING (true)
-- - "Profiles: update own" - USING (auth.uid() = id)
-- - "Profiles: delete own" - USING (auth.uid() = id)

-- Note: With Supabase Email Auth, the flow is:
-- 1. User signs up with email/password
-- 2. Supabase creates user in auth.users (session exists)
-- 3. Backend creates profile in public.profiles (can use auth.uid() = id)
-- 4. Both auth.uid() and service role can insert ✅
