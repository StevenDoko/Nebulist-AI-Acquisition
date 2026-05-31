-- Create booking_status enum type
CREATE TYPE booking_status AS ENUM (
  'pending',
  'confirmed',
  'cancelled',
  'completed'
);

-- Create bookings junction table (many-to-many between events and installations)
CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Foreign keys
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  installation_id UUID NOT NULL REFERENCES installations(id) ON DELETE RESTRICT,
  
  -- Booking details
  quantity INTEGER NOT NULL DEFAULT 1,
  duration_days INTEGER NOT NULL DEFAULT 1,
  
  -- Pricing
  unit_price DECIMAL(10, 2) NOT NULL,
  total_price DECIMAL(10, 2) NOT NULL,
  discount_amount DECIMAL(10, 2) DEFAULT 0,
  final_price DECIMAL(10, 2) NOT NULL,
  
  -- Status
  status booking_status NOT NULL DEFAULT 'pending',
  
  -- Additional information
  setup_notes TEXT,
  special_requirements TEXT,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP,
  
  -- Constraints
  CONSTRAINT positive_quantity CHECK (quantity > 0),
  CONSTRAINT positive_duration CHECK (duration_days > 0),
  CONSTRAINT positive_unit_price CHECK (unit_price >= 0),
  CONSTRAINT positive_total_price CHECK (total_price >= 0),
  CONSTRAINT positive_final_price CHECK (final_price >= 0),
  CONSTRAINT valid_discount CHECK (discount_amount >= 0 AND discount_amount <= total_price)
);

-- Create indexes for better query performance
CREATE INDEX idx_bookings_event_id ON bookings(event_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_bookings_installation_id ON bookings(installation_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_bookings_status ON bookings(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_bookings_deleted_at ON bookings(deleted_at);

-- Create composite index for event-installation lookup
CREATE UNIQUE INDEX idx_bookings_event_installation_unique 
  ON bookings(event_id, installation_id) 
  WHERE deleted_at IS NULL;

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_bookings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER bookings_updated_at_trigger
  BEFORE UPDATE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION update_bookings_updated_at();

-- Add RLS policies
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Allow public read access to non-deleted bookings
CREATE POLICY "Allow public read access to bookings"
  ON bookings FOR SELECT
  USING (deleted_at IS NULL);

-- Allow authenticated users to insert bookings
CREATE POLICY "Allow authenticated insert on bookings"
  ON bookings FOR INSERT
  WITH CHECK (true);

-- Allow authenticated users to update bookings
CREATE POLICY "Allow authenticated update on bookings"
  ON bookings FOR UPDATE
  USING (true);

-- Allow authenticated users to soft delete bookings
CREATE POLICY "Allow authenticated delete on bookings"
  ON bookings FOR DELETE
  USING (true);
