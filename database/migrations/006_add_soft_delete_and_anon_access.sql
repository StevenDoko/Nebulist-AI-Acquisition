-- Migration 006: Add soft delete support and anonymous read access
-- Description: Add deleted_at column and allow public access to installations catalog
-- Created: 2024-05-31

-- Add deleted_at column for soft delete support
ALTER TABLE installations 
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- Create index for soft delete queries
CREATE INDEX IF NOT EXISTS idx_installations_deleted_at ON installations(deleted_at);

-- Drop existing authenticated read policy and recreate with deleted_at check
DROP POLICY IF EXISTS "Authenticated users can view installations" ON installations;
CREATE POLICY "Authenticated users can view installations"
  ON installations
  FOR SELECT
  TO authenticated
  USING (deleted_at IS NULL);

-- Allow anonymous users to read non-deleted installations
CREATE POLICY "Anonymous users can view installations"
  ON installations
  FOR SELECT
  TO anon
  USING (deleted_at IS NULL);

-- Update other policies to respect soft delete
DROP POLICY IF EXISTS "Authenticated users can update installations" ON installations;
CREATE POLICY "Authenticated users can update installations"
  ON installations
  FOR UPDATE
  TO authenticated
  USING (deleted_at IS NULL)
  WITH CHECK (deleted_at IS NULL);

DROP POLICY IF EXISTS "Authenticated users can delete installations" ON installations;
CREATE POLICY "Authenticated users can delete installations"
  ON installations
  FOR DELETE
  TO authenticated
  USING (deleted_at IS NULL);
