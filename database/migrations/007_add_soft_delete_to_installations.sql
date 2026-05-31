-- Migration 007: Add soft delete to installations table
-- Description: Add deleted_at column for soft delete functionality
-- Created: 2024-05-31

-- Add deleted_at column
ALTER TABLE installations 
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- Create index for better query performance on non-deleted records
CREATE INDEX IF NOT EXISTS idx_installations_deleted_at ON installations(deleted_at) WHERE deleted_at IS NULL;

-- Update existing policies to exclude soft-deleted records
-- Drop old SELECT policy
DROP POLICY IF EXISTS "Authenticated users can view installations" ON installations;

-- Create new SELECT policy that excludes soft-deleted records
CREATE POLICY "Authenticated users can view active installations"
  ON installations
  FOR SELECT
  TO authenticated
  USING (deleted_at IS NULL);

-- Service role can still see all records (including soft-deleted)
-- No need to update service role policy as it already has full access

COMMENT ON COLUMN installations.deleted_at IS 'Timestamp when installation was soft deleted. NULL means active.';
