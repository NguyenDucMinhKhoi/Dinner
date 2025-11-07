-- ============================================================================
-- Migration 013: Add preferences columns to profiles table
-- ============================================================================
-- Description:
--   - Add seeking_gender (who user wants to match with)
--   - Add age_min and age_max (age range preferences)
--   - Add distance_km (maximum distance for matches)
--   - All columns are NULLABLE (user fills in step 4/5)
--   - Add constraints for data validation
-- ============================================================================

-- Add preferences columns (all nullable, default NULL)
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS seeking_gender TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS age_min INTEGER DEFAULT NULL,
ADD COLUMN IF NOT EXISTS age_max INTEGER DEFAULT NULL,
ADD COLUMN IF NOT EXISTS distance_km INTEGER DEFAULT NULL;

-- Add constraints for data validation (only when values are provided)
ALTER TABLE profiles
ADD CONSTRAINT check_seeking_gender 
  CHECK (seeking_gender IS NULL OR seeking_gender IN ('male', 'female', 'both'));

ALTER TABLE profiles
ADD CONSTRAINT check_age_min 
  CHECK (age_min IS NULL OR (age_min >= 18 AND age_min <= 100));

ALTER TABLE profiles
ADD CONSTRAINT check_age_max 
  CHECK (age_max IS NULL OR (age_max >= 18 AND age_max <= 100));

ALTER TABLE profiles
ADD CONSTRAINT check_age_range
  CHECK (age_min IS NULL OR age_max IS NULL OR age_max >= age_min);

ALTER TABLE profiles
ADD CONSTRAINT check_distance_km 
  CHECK (distance_km IS NULL OR (distance_km >= 1 AND distance_km <= 100));

-- Create indexes for faster matching queries (only for non-null values)
CREATE INDEX IF NOT EXISTS idx_profiles_seeking_gender 
  ON profiles (seeking_gender) WHERE seeking_gender IS NOT NULL;
  
CREATE INDEX IF NOT EXISTS idx_profiles_age_range 
  ON profiles (age_min, age_max) WHERE age_min IS NOT NULL AND age_max IS NOT NULL;
  
CREATE INDEX IF NOT EXISTS idx_profiles_distance 
  ON profiles (distance_km) WHERE distance_km IS NOT NULL;

-- Example usage for matching algorithm:
-- SELECT * FROM profiles
-- WHERE 
--   seeking_gender IN ('both', 'male')  -- User looking for males or both
--   AND EXTRACT(YEAR FROM AGE(birthdate)) BETWEEN 25 AND 35  -- Age range
--   AND is_complete = true
--   AND id != current_user_id
--   AND seeking_gender IS NOT NULL  -- Only users who completed preferences
--   AND age_min IS NOT NULL
--   AND age_max IS NOT NULL;

-- ============================================================================
-- NOTES:
-- ============================================================================
-- 1. seeking_gender: 'male' | 'female' | 'both' | NULL
-- 2. age_min/max: 18-100 | NULL (filled in step 4/5)
-- 3. distance_km: 1-100 km | NULL (filled in step 4/5)
-- 4. Constraints allow NULL or valid values only
-- 5. Partial indexes for better performance (only index non-null values)
-- ============================================================================
