-- 005_allow_public_read_all_profiles.sql
-- Allow public to read ALL profiles (no restrictions)
-- Run this in Supabase SQL Editor

-- Drop existing SELECT policy
DROP POLICY IF EXISTS "Profiles: select own or public complete" ON public.profiles;

-- Create new policy: Anyone can read any profile
CREATE POLICY "Profiles: public read all" ON public.profiles
  FOR SELECT
  USING (true);

-- Note: This allows:
-- 1. Anyone (authenticated or not) to see ALL profiles
-- 2. No restriction on is_complete field
-- 3. Full public access to profiles table for SELECT operations

-- INSERT/UPDATE/DELETE policies remain unchanged (still require auth)
