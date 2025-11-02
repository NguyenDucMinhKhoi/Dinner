-- 003_add_is_complete_and_update_policy.sql
-- Adds is_complete boolean to profiles and updates the public select policy
-- Run this BEFORE or in combination with your policy SQL so the column exists

-- Add the column (default false)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS is_complete boolean DEFAULT false;

-- Optionally: mark existing profiles as complete if you want them visible
-- Uncomment and run if you prefer all existing profiles to be considered complete:
-- UPDATE public.profiles SET is_complete = true WHERE is_complete IS NULL;

-- Update policy: drop and recreate public select policy to require is_complete = true
DROP POLICY IF EXISTS "Profiles: public select" ON public.profiles;
CREATE POLICY "Profiles: public select" ON public.profiles
  FOR SELECT
  USING (is_complete = true);

-- Notes:
-- 1) If RLS is already enabled and the old public select policy exists, this file will
--    replace it with the stricter version. Run this in SQL Editor.
-- 2) Running this will make profiles hidden from public SELECT until is_complete = true.
--    Consider setting is_complete = true on existing rows if you want them visible.
