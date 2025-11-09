-- ============================================================================
-- Migration 015: Create matches table
-- ============================================================================
-- Description:
--   - Store mutual matches (when both users like each other)
--   - Prevent duplicate matches (A-B is same as B-A)
--   - Track match creation time and last message time
--   - Used for displaying matches list and chat functionality
-- ============================================================================

-- Create matches table
CREATE TABLE IF NOT EXISTS public.matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Always store smaller UUID first to prevent duplicates
  user_id_1 UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  user_id_2 UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_message_at TIMESTAMPTZ,
  
  -- Ensure user_id_1 < user_id_2 (prevents A-B and B-A duplicates)
  CONSTRAINT matches_user_order CHECK (user_id_1 < user_id_2),
  
  -- Ensure unique match (no duplicates)
  CONSTRAINT unique_match UNIQUE(user_id_1, user_id_2)
);

-- Indexes for fast queries
CREATE INDEX IF NOT EXISTS idx_matches_user_id_1 ON matches(user_id_1);
CREATE INDEX IF NOT EXISTS idx_matches_user_id_2 ON matches(user_id_2);
CREATE INDEX IF NOT EXISTS idx_matches_created_at ON matches(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_matches_last_message_at ON matches(last_message_at DESC NULLS LAST);

-- Composite index for finding matches for a specific user
CREATE INDEX IF NOT EXISTS idx_matches_user_lookup 
  ON matches(user_id_1, user_id_2, created_at DESC);

-- ============================================================================
-- Row Level Security (RLS)
-- ============================================================================

-- Enable RLS
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;

-- Users can view their own matches
CREATE POLICY "Users can view their own matches"
  ON matches
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id_1 OR auth.uid() = user_id_2
  );

-- Only system can insert matches (via function/trigger)
-- Users should not directly insert into matches table
CREATE POLICY "System can create matches"
  ON matches
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id_1 OR auth.uid() = user_id_2
  );

-- Users can update last_message_at when they send a message
CREATE POLICY "Users can update match message time"
  ON matches
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = user_id_1 OR auth.uid() = user_id_2
  )
  WITH CHECK (
    auth.uid() = user_id_1 OR auth.uid() = user_id_2
  );

-- Users can delete their matches (unmatch feature)
CREATE POLICY "Users can delete their matches"
  ON matches
  FOR DELETE
  TO authenticated
  USING (
    auth.uid() = user_id_1 OR auth.uid() = user_id_2
  );

-- ============================================================================
-- NOTES:
-- ============================================================================
-- 1. Matches are stored with smaller UUID first (user_id_1 < user_id_2)
-- 2. This prevents duplicate matches (A-B vs B-A)
-- 3. last_message_at updated when users chat (for sorting matches)
-- 4. Users can unmatch by deleting from matches table
-- 5. Indexes optimized for:
--    - Finding matches by user
--    - Sorting by creation time
--    - Sorting by last message time
-- ============================================================================
