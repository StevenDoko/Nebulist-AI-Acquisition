-- Migration 006: Allow anonymous users to read installations
-- Description: Add RLS policy to allow public access to installations catalog
-- Created: 2024-05-31

-- Allow anonymous users to read all installations
CREATE POLICY "Anonymous users can view installations"
  ON installations
  FOR SELECT
  TO anon
  USING (deleted_at IS NULL);
