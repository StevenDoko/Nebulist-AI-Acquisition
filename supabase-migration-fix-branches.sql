-- Migration Script: Fix Branch Column Values
-- This script updates invalid branch values (city names) to valid branch types
-- Run this in your Supabase SQL Editor

-- Step 1: Check current invalid branch values
SELECT DISTINCT branch, COUNT(*) as count
FROM leads
WHERE branch NOT IN ('schools', 'festivals', 'nightclub', 'wedding')
GROUP BY branch;

-- Step 2: Update branch values based on city/location mapping
-- You need to manually decide which city should map to which branch
-- Below is an example mapping - adjust according to your business logic:

-- Option A: Map all to a default branch (festivals)
-- UPDATE leads 
-- SET branch = 'festivals' 
-- WHERE branch NOT IN ('schools', 'festivals', 'nightclub', 'wedding');

-- Option B: Map based on city characteristics (example mapping)
-- Rotterdam -> nightclub (urban nightlife)
UPDATE leads SET branch = 'nightclub' WHERE branch = 'rotterdam';

-- Utrecht -> schools (university city)
UPDATE leads SET branch = 'schools' WHERE branch = 'utrecht';

-- Amsterdam -> nightclub (nightlife hub)
UPDATE leads SET branch = 'nightclub' WHERE branch = 'amsterdam';

-- Eindhoven -> festivals (events city)
UPDATE leads SET branch = 'festivals' WHERE branch = 'eindhoven';

-- Den Haag -> wedding (elegant venues)
UPDATE leads SET branch = 'wedding' WHERE branch = 'denhaag';

-- Maastricht -> wedding (romantic city)
UPDATE leads SET branch = 'wedding' WHERE branch = 'maastricht';

-- Step 3: Verify the update
SELECT branch, COUNT(*) as count
FROM leads
GROUP BY branch
ORDER BY branch;

-- Step 4: Add constraint to prevent future invalid values (optional)
-- ALTER TABLE leads 
-- ADD CONSTRAINT valid_branch_types 
-- CHECK (branch IN ('schools', 'festivals', 'nightclub', 'wedding'));
