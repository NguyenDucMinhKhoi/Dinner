-- ============================================================================
-- Migration 017: Add indexes for profiles table (optimize matching)
-- ============================================================================
-- Description:
--   - Add missing indexes for profiles table to optimize matching queries
--   - Gender, birthdate, location indexes
--   - Composite indexes for common query patterns
-- ============================================================================

-- Gender index (for gender filtering)
CREATE INDEX IF NOT EXISTS idx_profiles_gender 
  ON profiles(gender) 
  WHERE gender IS NOT NULL;

-- Birthdate index (for age calculations)
CREATE INDEX IF NOT EXISTS idx_profiles_birthdate 
  ON profiles(birthdate) 
  WHERE birthdate IS NOT NULL;

-- Location indexes (for distance calculations)
CREATE INDEX IF NOT EXISTS idx_profiles_latitude 
  ON profiles(latitude) 
  WHERE latitude IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_profiles_longitude 
  ON profiles(longitude) 
  WHERE longitude IS NOT NULL;

-- Composite location index
CREATE INDEX IF NOT EXISTS idx_profiles_lat_lon 
  ON profiles(latitude, longitude) 
  WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

-- is_complete index (filter out incomplete profiles)
CREATE INDEX IF NOT EXISTS idx_profiles_is_complete 
  ON profiles(is_complete) 
  WHERE is_complete = true;

-- Interests index (for common interests matching)
-- GIN index is optimal for array operations (overlap &&)
CREATE INDEX IF NOT EXISTS idx_profiles_interests_gin 
  ON profiles USING GIN(interests)
  WHERE interests IS NOT NULL;

-- Composite index for discovery query optimization
CREATE INDEX IF NOT EXISTS idx_profiles_discovery 
  ON profiles(is_complete, gender, birthdate) 
  WHERE is_complete = true 
    AND avatar_url IS NOT NULL 
    AND avatar_url != '';

-- ============================================================================
-- NOTES:
-- ============================================================================
-- 1. Indexes added for:
--    - Gender filtering
--    - Age range calculations (birthdate)
--    - Distance calculations (latitude/longitude)
--    - Common interests (GIN index for array overlap)
--
-- 2. Partial indexes used where appropriate to reduce index size
--    (only index rows that will actually be queried)
--
-- 3. These indexes dramatically improve query performance:
--    - Without indexes: Full table scan (seconds)
--    - With indexes: Index scan (milliseconds)
-- ============================================================================
