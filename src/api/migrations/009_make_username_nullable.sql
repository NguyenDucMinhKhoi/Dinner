-- Migration 009: Make username nullable during signup
-- Issue: New users don't have username yet (collected in profile setup)
-- Solution: Allow username to be NULL initially, will be filled later

-- Allow username to be NULL
ALTER TABLE profiles 
ALTER COLUMN username DROP NOT NULL;

-- Add comment for clarity
COMMENT ON COLUMN profiles.username IS 
'Display name of the user. Can be NULL during signup, must be filled in profile setup.';

-- Optional: Add a check to ensure username is filled when profile is complete
-- This ensures data integrity while allowing flexibility during signup
ALTER TABLE profiles
ADD CONSTRAINT username_required_when_complete
CHECK (
  (is_complete = false) OR 
  (is_complete = true AND username IS NOT NULL AND trim(username) != '')
);

COMMENT ON CONSTRAINT username_required_when_complete ON profiles IS
'Ensures username is filled when profile setup is complete';
