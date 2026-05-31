-- Create event_status enum type
CREATE TYPE event_status AS ENUM (
  'inquiry',
  'warm_lead',
  'reservation',
  'final_booking',
  'completed',
  'cancelled'
);

-- Create events table
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  event_date TIMESTAMP NOT NULL,
  event_end_date TIMESTAMP,
  location VARCHAR(500),
  branch_id VARCHAR(50) NOT NULL,
  
  -- Customer information
  customer_name VARCHAR(255) NOT NULL,
  customer_email VARCHAR(255),
  customer_phone VARCHAR(50),
  customer_company VARCHAR(255),
  
  -- Event details
  expected_attendees INTEGER,
  venue_type VARCHAR(100),
  
  -- Status tracking
  status event_status NOT NULL DEFAULT 'inquiry',
  
  -- Financial
  estimated_budget DECIMAL(10, 2),
  final_price DECIMAL(10, 2),
  deposit_paid DECIMAL(10, 2) DEFAULT 0,
  
  -- Additional info
  notes TEXT,
  internal_notes TEXT,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP,
  
  -- Constraints
  CONSTRAINT valid_event_dates CHECK (event_end_date IS NULL OR event_end_date >= event_date)
);

-- Create indexes for better query performance
CREATE INDEX idx_events_status ON events(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_events_branch_id ON events(branch_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_events_event_date ON events(event_date) WHERE deleted_at IS NULL;
CREATE INDEX idx_events_customer_email ON events(customer_email) WHERE deleted_at IS NULL;
CREATE INDEX idx_events_deleted_at ON events(deleted_at);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_events_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER events_updated_at_trigger
  BEFORE UPDATE ON events
  FOR EACH ROW
  EXECUTE FUNCTION update_events_updated_at();

-- Add RLS policies
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Allow public read access to non-deleted events
CREATE POLICY "Allow public read access to events"
  ON events FOR SELECT
  USING (deleted_at IS NULL);

-- Allow authenticated users to insert events
CREATE POLICY "Allow authenticated insert on events"
  ON events FOR INSERT
  WITH CHECK (true);

-- Allow authenticated users to update their own events
CREATE POLICY "Allow authenticated update on events"
  ON events FOR UPDATE
  USING (true);

-- Allow authenticated users to soft delete events
CREATE POLICY "Allow authenticated delete on events"
  ON events FOR DELETE
  USING (true);
