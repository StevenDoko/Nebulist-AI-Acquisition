-- Add lead_id column to events table to track which CRM lead created this event
ALTER TABLE events
ADD COLUMN IF NOT EXISTS lead_id UUID;

-- Add index for faster lookups (without deleted_at filter since that column may not exist)
CREATE INDEX IF NOT EXISTS idx_events_lead_id ON events(lead_id);

-- Add comment for documentation
COMMENT ON COLUMN events.lead_id IS 'Reference to the CRM lead that created this event (if applicable)';
