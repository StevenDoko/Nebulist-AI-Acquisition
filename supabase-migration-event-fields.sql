-- Add event detail fields to leads table
-- These fields are used for compatibility scoring calculation

ALTER TABLE leads
ADD COLUMN IF NOT EXISTS event_type TEXT,
ADD COLUMN IF NOT EXISTS event_frequency TEXT,
ADD COLUMN IF NOT EXISTS estimated_budget TEXT;

-- Add comments for documentation
COMMENT ON COLUMN leads.event_type IS 'Type of event (e.g., Music Festival, School Event, Wedding Reception)';
COMMENT ON COLUMN leads.event_frequency IS 'How often events occur (e.g., Annual, Monthly, Weekly, One-time)';
COMMENT ON COLUMN leads.estimated_budget IS 'Budget range for events (e.g., €50,000 - €100,000)';

-- Create index for event_type for faster filtering
CREATE INDEX IF NOT EXISTS idx_leads_event_type ON leads(event_type);
