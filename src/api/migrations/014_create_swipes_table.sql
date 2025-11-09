-- ============================================================================
-- Migration 014: Create swipes table
-- ============================================================================
-- Description:
--   - Track all swipe actions (like/pass) from users
--   - Each user can only swipe once per target user
--   - Used to prevent showing same profile twice
--   - Used to detect matches (mutual likes)
-- ============================================================================

-- Create swipes table
CREATE TABLE IF NOT EXISTS public.swipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Who performed the swipe
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Who was swiped on
  target_user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Action: 'like' or 'pass'
  action VARCHAR(10) NOT NULL CHECK (action IN ('like', 'pass')),
  
  -- Timestamp
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure each user can only swipe once per target
  CONSTRAINT unique_swipe UNIQUE(user_id, target_user_id),
  
  -- User cannot swipe themselves
  CONSTRAINT no_self_swipe CHECK (user_id != target_user_id)
);

-- Indexes for fast queries
CREATE INDEX IF NOT EXISTS idx_swipes_user_id ON swipes(user_id);
CREATE INDEX IF NOT EXISTS idx_swipes_target_user_id ON swipes(target_user_id);
CREATE INDEX IF NOT EXISTS idx_swipes_action ON swipes(action);
CREATE INDEX IF NOT EXISTS idx_swipes_user_target ON swipes(user_id, target_user_id);

-- Index for finding mutual likes (matching algorithm)
CREATE INDEX IF NOT EXISTS idx_swipes_like_lookup 
  ON swipes(target_user_id, user_id) 
  WHERE action = 'like';

-- ============================================================================
-- Row Level Security (RLS)
-- ============================================================================

-- Enable RLS
ALTER TABLE swipes ENABLE ROW LEVEL SECURITY;

-- Users can insert their own swipes
CREATE POLICY "Users can create their own swipes"
  ON swipes
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can view their own swipes
CREATE POLICY "Users can view their own swipes"
  ON swipes
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can view swipes where they are the target (to check for matches)
CREATE POLICY "Users can view swipes targeting them"
  ON swipes
  FOR SELECT
  TO authenticated
  USING (auth.uid() = target_user_id);

-- Users cannot update or delete swipes (permanent record)
-- No UPDATE or DELETE policies = no one can modify/delete

-- ============================================================================
-- NOTES:
-- ============================================================================
-- 1. Swipes are immutable (no update/delete) - permanent record
-- 2. Each user can only swipe once per target (UNIQUE constraint)
-- 3. action must be 'like' or 'pass'
-- 4. Users cannot swipe themselves (CHECK constraint)
-- 5. Indexes optimized for:
--    - Finding swipes by user
--    - Finding swipes by target
--    - Matching algorithm (mutual likes)
-- ============================================================================
