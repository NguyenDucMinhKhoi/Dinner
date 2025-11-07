-- Migration 011: Cleanup RLS Policies for Profiles Table
-- Issue: Duplicate and conflicting policies causing errors
-- Solution: Drop all old policies and create clean, simple policies

-- ============================================================================
-- PART 1: DROP ALL EXISTING POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "Profiles: insert own or service" ON profiles;
DROP POLICY IF EXISTS "Profiles: allow insert for authenticated" ON profiles;
DROP POLICY IF EXISTS "Profiles: public read all" ON profiles;
DROP POLICY IF EXISTS "Profiles: allow public select" ON profiles;
DROP POLICY IF EXISTS "Profiles: update own" ON profiles;
DROP POLICY IF EXISTS "Profiles: update own profile" ON profiles;
DROP POLICY IF EXISTS "Profiles: delete own" ON profiles;
DROP POLICY IF EXISTS "Profiles: delete own profile" ON profiles;

-- ============================================================================
-- PART 2: CREATE CLEAN POLICIES
-- ============================================================================

-- SELECT: Public read access
-- Needed for: email duplicate check, profile browsing, user search
CREATE POLICY "profiles_select_public"
ON profiles FOR SELECT
TO public
USING (true);

-- INSERT: Authenticated users can create profile
-- This allows signUp() to create profile after user creation
CREATE POLICY "profiles_insert_authenticated"
ON profiles FOR INSERT
TO authenticated
WITH CHECK (true);

-- UPDATE: Users can only update their own profile
CREATE POLICY "profiles_update_own"
ON profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- DELETE: Users can only delete their own profile
CREATE POLICY "profiles_delete_own"
ON profiles FOR DELETE
TO authenticated
USING (auth.uid() = id);

-- ============================================================================
-- PART 3: ADD DOCUMENTATION
-- ============================================================================

COMMENT ON POLICY "profiles_select_public" ON profiles IS 
'Allows public read access for profile browsing and email validation.';

COMMENT ON POLICY "profiles_insert_authenticated" ON profiles IS 
'Allows authenticated users to create their profile after signup.';

COMMENT ON POLICY "profiles_update_own" ON profiles IS 
'Users can only update their own profile.';

COMMENT ON POLICY "profiles_delete_own" ON profiles IS 
'Users can only delete their own profile.';
