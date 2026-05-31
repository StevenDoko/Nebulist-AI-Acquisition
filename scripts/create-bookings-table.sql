-- Bookings/Reservations Table
-- This table stores automated bookings from email replies

CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Link to lead
  lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
  
  -- Client Information
  client_name VARCHAR(255) NOT NULL,
  client_email VARCHAR(255) NOT NULL,
  client_phone VARCHAR(50),
  company_name VARCHAR(255),
  
  -- Event Details
  event_date DATE,
  event_time TIME,
  event_type VARCHAR(100), -- wedding, corporate, festival, etc.
  venue_name VARCHAR(255),
  venue_type VARCHAR(100), -- indoor, outdoor, etc.
  venue_address TEXT,
  
  -- Bubble Machine Details
  number_of_guests INTEGER,
  number_of_machines INTEGER DEFAULT 1,
  duration_hours DECIMAL(4,2),
  special_requirements TEXT,
  
  -- Pricing
  estimated_budget DECIMAL(10,2),
  quoted_price DECIMAL(10,2),
  final_price DECIMAL(10,2),
  currency VARCHAR(10) DEFAULT 'EUR',
  
  -- Status Tracking
  status VARCHAR(50) DEFAULT 'pending', -- pending, confirmed, cancelled, completed
  booking_source VARCHAR(50) DEFAULT 'email_auto', -- email_auto, manual, website, phone
  confidence_score DECIMAL(3,2), -- AI confidence (0.00 to 1.00)
  
  -- Email Reference
  email_thread_id VARCHAR(255),
  email_message_id VARCHAR(255),
  email_subject TEXT,
  email_body TEXT,
  email_received_at TIMESTAMP,
  
  -- AI Analysis
  sentiment VARCHAR(50), -- positive, neutral, negative
  extracted_keywords TEXT[], -- array of keywords found
  ai_notes TEXT, -- AI analysis notes
  
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by UUID REFERENCES users(id),
  confirmed_at TIMESTAMP,
  cancelled_at TIMESTAMP,
  cancellation_reason TEXT,
  
  -- Notes
  internal_notes TEXT,
  client_notes TEXT
);

-- Indexes for performance
CREATE INDEX idx_bookings_lead_id ON bookings(lead_id);
CREATE INDEX idx_bookings_client_email ON bookings(client_email);
CREATE INDEX idx_bookings_event_date ON bookings(event_date);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_created_at ON bookings(created_at);
CREATE INDEX idx_bookings_email_thread_id ON bookings(email_thread_id);

-- Updated at trigger
CREATE OR REPLACE FUNCTION update_bookings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_bookings_updated_at
  BEFORE UPDATE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION update_bookings_updated_at();

-- Comments
COMMENT ON TABLE bookings IS 'Stores event bookings and reservations, including auto-generated from email replies';
COMMENT ON COLUMN bookings.confidence_score IS 'AI confidence score for auto-generated bookings (0.00 to 1.00)';
COMMENT ON COLUMN bookings.booking_source IS 'Source of booking: email_auto, manual, website, phone';
COMMENT ON COLUMN bookings.sentiment IS 'Email sentiment analysis: positive, neutral, negative';
