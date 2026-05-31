-- Migration: Create Storage Policies for Installations Bucket
-- Description: Allow public read access and authenticated upload/delete for installations bucket
-- Created: 2026-05-31

-- Policy 1: Allow public read access to installations bucket
CREATE POLICY "Public read access for installations"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'installations');

-- Policy 2: Allow authenticated users to upload to installations bucket
CREATE POLICY "Authenticated upload to installations"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'installations');

-- Policy 3: Allow authenticated users to delete from installations bucket
CREATE POLICY "Authenticated delete from installations"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'installations');

-- Policy 4: Allow authenticated users to update files in installations bucket
CREATE POLICY "Authenticated update in installations"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'installations')
WITH CHECK (bucket_id = 'installations');
