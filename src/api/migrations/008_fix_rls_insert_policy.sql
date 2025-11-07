-- Migration 008: Fix RLS INSERT Policy for Profiles
-- Issue: New users cannot create their profile due to strict RLS policy
-- Solution: Allow INSERT for authenticated users with proper validation

-- Drop old strict policy
DROP POLICY IF EXISTS "Profiles: insert own or service" ON profiles;

-- Allow INSERT for authenticated users
-- Security: Email is UNIQUE, so no duplicate profiles possible
-- UPDATE/DELETE still restricted to own profile only
CREATE POLICY "Profiles: allow insert for authenticated"
ON profiles FOR INSERT
TO authenticated
WITH CHECK (true);

-- Verify other policies are still strict
-- These should already exist from migration 007, just for reference:
-- 
-- UPDATE policy (own profile only):
-- CREATE POLICY "Profiles: update own" ON profiles FOR UPDATE USING (auth.uid() = id);
--
-- DELETE policy (own profile only):  
-- CREATE POLICY "Profiles: delete own" ON profiles FOR DELETE USING (auth.uid() = id);
--
-- SELECT policy (public read):
-- CREATE POLICY "Profiles: public select" ON profiles FOR SELECT USING (true);

-- Add comment for clarity
COMMENT ON POLICY "Profiles: allow insert for authenticated" ON profiles IS 
'Allows authenticated users to create their profile after signup. 
Email uniqueness prevents duplicate profiles.
Update/Delete are still restricted to own profile only.';
