-- ============================================================================
-- Migration 012: Add interests column to profiles table
-- ============================================================================
-- Description:
--   - Add interests column (TEXT[] array) to store user's selected interests
--   - Store only keys (e.g., 'music', 'movies') without emojis
--   - UI will map keys to display labels with emojis
-- ============================================================================

-- Add interests column as TEXT array
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS interests TEXT[] DEFAULT '{}';

-- Create index for faster search (GIN index for array contains queries)
CREATE INDEX IF NOT EXISTS idx_profiles_interests ON profiles USING GIN (interests);

-- Example usage:
-- UPDATE profiles SET interests = ARRAY['music', 'movies', 'cooking'] WHERE id = 'user-uuid';
-- SELECT * FROM profiles WHERE 'music' = ANY(interests); -- Find users who like music
-- SELECT * FROM profiles WHERE interests && ARRAY['music', 'movies']; -- Find users with any matching interests

-- ============================================================================
-- NOTES:
-- ============================================================================
-- 1. Use TEXT[] instead of JSONB for simpler array operations
-- 2. GIN index allows fast array containment queries
-- 3. Frontend INTEREST_MAP will convert keys to emoji labels
-- ============================================================================
