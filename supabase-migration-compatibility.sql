-- Migration: Add Compatibility Scoring to Leads Table
-- Description: Adds compatibility scoring fields for event-machine matching
-- This helps determine how well a lead's event matches with Nebulist's bubble machines

-- Add compatibility columns
ALTER TABLE leads
ADD COLUMN IF NOT EXISTS compatibility_score INTEGER CHECK (compatibility_score >= 0 AND compatibility_score <= 100),
ADD COLUMN IF NOT EXISTS compatibility_reason TEXT;

-- Create index for compatibility queries
CREATE INDEX IF NOT EXISTS idx_leads_compatibility_score ON leads(compatibility_score);

-- Add comments
COMMENT ON COLUMN leads.compatibility_score IS 'Event-machine compatibility score (0-100%): 0-40% = cold, 41-70% = warm, 71-100% = hot';
COMMENT ON COLUMN leads.compatibility_reason IS 'AI-generated explanation for compatibility score based on event type and branch';

-- Update existing leads with default compatibility (50% - neutral)
UPDATE leads 
SET compatibility_score = 50,
    compatibility_reason = 'Pending analysis - default score assigned'
WHERE compatibility_score IS NULL;
