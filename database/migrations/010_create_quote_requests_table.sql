-- Create quote_request_status enum type
CREATE TYPE quote_request_status AS ENUM (
  'pending',
  'reviewing',
  'quoted',
  'accepted',
  'rejected',
  'expired'
);

-- Create quote_requests table
CREATE TABLE IF NOT EXISTS quote_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Customer information
  customer_name VARCHAR(255) NOT NULL,
  customer_email VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(50),
  customer_company VARCHAR(255),
  
  -- Event details
  event_name VARCHAR(255),
  event_date TIMESTAMP,
  event_end_date TIMESTAMP,
  event_location VARCHAR(500),
  expected_attendees INTEGER,
  venue_type VARCHAR(100),
  branch_id VARCHAR(50) NOT NULL,
  
  -- Requested installations (stored as JSONB array of installation IDs and quantities)
  requested_installations JSONB NOT NULL DEFAULT '[]',
  -- Example: [{"installation_id": "uuid", "quantity": 2, "duration_days": 3}]
  
  -- Customer message
  message TEXT,
  special_requirements TEXT,
  
  -- Budget
  estimated_budget DECIMAL(10, 2),
  
  -- Status tracking
  status quote_request_status NOT NULL DEFAULT 'pending',
  
  -- Admin response
  admin_notes TEXT,
  quoted_price DECIMAL(10, 2),
  quote_details JSONB,
  -- Example: {"items": [...], "subtotal": 1000, "tax": 100, "total": 1100, "valid_until": "2024-12-31"}
  
  quoted_at TIMESTAMP,
  quoted_by VARCHAR(255),
  
  -- Response tracking
  responded_at TIMESTAMP,
  response_notes TEXT,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP,
  
  -- Constraints
  CONSTRAINT valid_event_dates CHECK (event_end_date IS NULL OR event_end_date >= event_date),
  CONSTRAINT positive_budget CHECK (estimated_budget IS NULL OR estimated_budget >= 0),
  CONSTRAINT positive_quoted_price CHECK (quoted_price IS NULL OR quoted_price >= 0)
);

-- Create indexes for better query performance
CREATE INDEX idx_quote_requests_status ON quote_requests(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_quote_requests_branch_id ON quote_requests(branch_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_quote_requests_customer_email ON quote_requests(customer_email) WHERE deleted_at IS NULL;
CREATE INDEX idx_quote_requests_event_date ON quote_requests(event_date) WHERE deleted_at IS NULL;
CREATE INDEX idx_quote_requests_created_at ON quote_requests(created_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX idx_quote_requests_deleted_at ON quote_requests(deleted_at);

-- Create GIN index for JSONB columns for better query performance
CREATE INDEX idx_quote_requests_requested_installations ON quote_requests USING GIN (requested_installations);
CREATE INDEX idx_quote_requests_quote_details ON quote_requests USING GIN (quote_details);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_quote_requests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER quote_requests_updated_at_trigger
  BEFORE UPDATE ON quote_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_quote_requests_updated_at();

-- Add RLS policies
ALTER TABLE quote_requests ENABLE ROW LEVEL SECURITY;

-- Allow public read access to non-deleted quote requests (for customers to check their own)
CREATE POLICY "Allow public read access to quote_requests"
  ON quote_requests FOR SELECT
  USING (deleted_at IS NULL);

-- Allow anyone to insert quote requests (public form submission)
CREATE POLICY "Allow public insert on quote_requests"
  ON quote_requests FOR INSERT
  WITH CHECK (true);

-- Allow authenticated users to update quote requests
CREATE POLICY "Allow authenticated update on quote_requests"
  ON quote_requests FOR UPDATE
  USING (true);

-- Allow authenticated users to soft delete quote requests
CREATE POLICY "Allow authenticated delete on quote_requests"
  ON quote_requests FOR DELETE
  USING (true);
