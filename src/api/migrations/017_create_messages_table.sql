-- ============================================================================
-- Migration 017: Create messages table
-- ============================================================================
-- Description:
--   - Store chat messages between matched users
--   - Track read status for unread badges
--   - Support different message types (text, image, location)
--   - No trigger - last_message_at updated manually in application code
-- ============================================================================

-- Create messages table
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Foreign keys
  match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Message content
  content TEXT NOT NULL,
  
  -- Message type (for future: text, image, location, etc.)
  message_type VARCHAR(20) DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'location')),
  
  -- Read status
  read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMPTZ,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT message_content_not_empty CHECK (char_length(content) > 0),
  CONSTRAINT message_content_max_length CHECK (char_length(content) <= 5000)
);

-- ============================================================================
-- Indexes (Performance optimization)
-- ============================================================================

-- Primary index for fetching messages in a match conversation
CREATE INDEX IF NOT EXISTS idx_messages_match_id_created 
  ON messages(match_id, created_at DESC);

-- Index for sender queries
CREATE INDEX IF NOT EXISTS idx_messages_sender_id 
  ON messages(sender_id);

-- Partial index for unread messages (efficient for counting unread)
CREATE INDEX IF NOT EXISTS idx_messages_unread 
  ON messages(match_id, sender_id) 
  WHERE read = FALSE;

-- General timestamp index for sorting
CREATE INDEX IF NOT EXISTS idx_messages_created_at 
  ON messages(created_at DESC);

-- ============================================================================
-- Row Level Security (RLS)
-- ============================================================================

-- Enable RLS
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Policy 1: Users can view messages in their matches
CREATE POLICY "Users can view messages in their matches"
  ON messages
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM matches 
      WHERE matches.id = messages.match_id 
      AND (matches.user_id_1 = auth.uid() OR matches.user_id_2 = auth.uid())
    )
  );

-- Policy 2: Users can send messages in their matches
CREATE POLICY "Users can send messages in their matches"
  ON messages
  FOR INSERT
  TO authenticated
  WITH CHECK (
    sender_id = auth.uid() 
    AND EXISTS (
      SELECT 1 FROM matches 
      WHERE matches.id = match_id 
      AND (matches.user_id_1 = auth.uid() OR matches.user_id_2 = auth.uid())
    )
  );

-- Policy 3: Users can update their own messages (for read status, edit feature)
CREATE POLICY "Users can update messages in their matches"
  ON messages
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM matches 
      WHERE matches.id = messages.match_id 
      AND (matches.user_id_1 = auth.uid() OR matches.user_id_2 = auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM matches 
      WHERE matches.id = messages.match_id 
      AND (matches.user_id_1 = auth.uid() OR matches.user_id_2 = auth.uid())
    )
  );

-- Policy 4: Users can delete their own messages
CREATE POLICY "Users can delete their own messages"
  ON messages
  FOR DELETE
  TO authenticated
  USING (sender_id = auth.uid());

-- ============================================================================
-- NOTES:
-- ============================================================================
-- 1. Messages belong to a match (match_id FK)
-- 2. Sender must be one of the users in that match
-- 3. Read status tracks if message has been seen by recipient
-- 4. message_type allows future expansion (images, locations, etc.)
-- 5. Content length: 1-5000 characters
-- 6. Indexes optimized for:
--    - Fetching conversation history (match_id + created_at)
--    - Counting unread messages (partial index on unread)
--    - Real-time queries (created_at)
-- 7. NO TRIGGER: matches.last_message_at updated manually in app code
-- 8. ON DELETE CASCADE: if match deleted, all messages deleted
-- ============================================================================
