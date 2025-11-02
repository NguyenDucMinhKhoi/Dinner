-- 004_fix_auth_policies.sql
-- Fix RLS policies to allow authenticated users to query their own profile
-- even when is_complete = false
-- Run this in Supabase SQL Editor

-- Drop existing policies
DROP POLICY IF EXISTS "Profiles: public select" ON public.profiles;
DROP POLICY IF EXISTS "Profiles: insert own profile" ON public.profiles;

-- New SELECT policy: Allow authenticated users to see their own profile (any state)
-- + Allow public to see only completed profiles
CREATE POLICY "Profiles: select own or public complete" ON public.profiles
  FOR SELECT
  USING (
    auth.uid() = id -- User can see their own profile
    OR is_complete = true -- Or anyone can see completed profiles
  );

-- New INSERT policy: Allow authenticated users to create their own profile
CREATE POLICY "Profiles: insert own profile" ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Note: This allows:
-- 1. Authenticated users to query their own profile (for checking if exists)
-- 2. Public to see only completed profiles (for discovery)
-- 3. Users to create their own profile when signing up
