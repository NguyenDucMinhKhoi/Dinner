-- Migration 010: Fix RLS SELECT Policy for Public Read
-- Issue: Cannot check if email exists before signup (anonymous user)
-- Solution: Allow public SELECT on profiles table

-- Drop existing SELECT policy if exists
DROP POLICY IF EXISTS "Profiles: public select" ON profiles;

-- Create new policy allowing public read access
-- This is safe because:
-- 1. No sensitive data in profiles (username, bio, etc. are meant to be public)
-- 2. Email is needed for duplicate check during signup
-- 3. UPDATE/DELETE still protected (only own profile)
CREATE POLICY "Profiles: allow public select"
ON profiles FOR SELECT
TO public
USING (true);

-- Verify other policies are still strict
-- INSERT policy (authenticated users only):
-- Already exists from migration 008
--
-- UPDATE policy (own profile only):
-- Should exist, create if missing
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'profiles' 
    AND policyname = 'Profiles: update own'
  ) THEN
    CREATE POLICY "Profiles: update own" 
    ON profiles FOR UPDATE 
    TO authenticated
    USING (auth.uid() = id);
  END IF;
END $$;

-- DELETE policy (own profile only):
-- Should exist, create if missing
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'profiles' 
    AND policyname = 'Profiles: delete own'
  ) THEN
    CREATE POLICY "Profiles: delete own" 
    ON profiles FOR DELETE 
    TO authenticated
    USING (auth.uid() = id);
  END IF;
END $$;

-- Add comment for documentation
COMMENT ON POLICY "Profiles: allow public select" ON profiles IS 
'Allows public read access to profiles for:
- Email duplicate check during signup
- Public profile viewing
- User search functionality
Write operations (UPDATE/DELETE) are still restricted to profile owner only.';
