-- Migration 005: Create installations table
-- Description: Create table for storing installation catalog data
-- Created: 2024-05-31

-- Create installations table
CREATE TABLE IF NOT EXISTS installations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'booked', 'maintenance')),
  popularity INTEGER DEFAULT 0,
  
  -- JSON columns for complex data
  dimensions JSONB DEFAULT '{"width": 0, "height": 0, "depth": 0}'::jsonb,
  requirements JSONB DEFAULT '{"operators": 1, "setupTime": 60, "electricity": "", "windResistance": "", "space": ""}'::jsonb,
  pricing JSONB DEFAULT '{"perDay": 0, "perWeekend": 0, "perWeek": 0}'::jsonb,
  media JSONB DEFAULT '[]'::jsonb,
  specifications JSONB DEFAULT '[]'::jsonb,
  suitable_for JSONB DEFAULT '[]'::jsonb,
  
  availability TEXT DEFAULT 'available',
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_installations_status ON installations(status);
CREATE INDEX IF NOT EXISTS idx_installations_type ON installations(type);
CREATE INDEX IF NOT EXISTS idx_installations_created_at ON installations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_installations_popularity ON installations(popularity DESC);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_installations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_installations_updated_at
  BEFORE UPDATE ON installations
  FOR EACH ROW
  EXECUTE FUNCTION update_installations_updated_at();

-- Enable Row Level Security
ALTER TABLE installations ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Allow service role full access
CREATE POLICY "Service role has full access to installations"
  ON installations
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Allow authenticated users to read all installations
CREATE POLICY "Authenticated users can view installations"
  ON installations
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow authenticated users to insert installations
CREATE POLICY "Authenticated users can create installations"
  ON installations
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Allow authenticated users to update installations
CREATE POLICY "Authenticated users can update installations"
  ON installations
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Allow authenticated users to delete installations
CREATE POLICY "Authenticated users can delete installations"
  ON installations
  FOR DELETE
  TO authenticated
  USING (true);

-- Insert sample data
INSERT INTO installations (name, type, description, status, popularity, dimensions, requirements, pricing, media, specifications, suitable_for) VALUES
(
  'Large Bubble Machine',
  'Interactive',
  'Create massive floating bubbles up to 1 meter in diameter. Perfect for festivals and outdoor events.',
  'available',
  95,
  '{"width": 100, "height": 100, "depth": 50}'::jsonb,
  '{"operators": 1, "setupTime": 60, "electricity": "220V, 16A", "windResistance": "Max 15 km/h", "space": "10x10m"}'::jsonb,
  '{"base": 1000, "perDay": 1000, "perWeekend": 1800, "perWeek": 4500}'::jsonb,
  '[]'::jsonb,
  '["Bubble solution included", "Weather resistant", "Remote control", "LED lighting optional"]'::jsonb,
  '["festivals", "wedding"]'::jsonb
),
(
  'Giant Bubble Machine XL',
  'Interactive',
  'Our flagship giant bubble machine creates massive, floating bubbles up to 2 meters in diameter. Perfect for large-scale events.',
  'available',
  98,
  '{"width": 300, "height": 250, "depth": 100}'::jsonb,
  '{"operators": 2, "setupTime": 90, "electricity": "220V, 16A", "windResistance": "Max 20 km/h", "space": "15x15m"}'::jsonb,
  '{"base": 1500, "perDay": 1500, "perWeekend": 2700, "perWeek": 6500}'::jsonb,
  '[]'::jsonb,
  '["Professional grade", "Bubble solution included", "Weather resistant", "Remote control", "LED lighting included"]'::jsonb,
  '["festivals", "nightclub", "wedding"]'::jsonb
),
(
  'Educational Bubble Lab',
  'Educational',
  'Interactive bubble science station designed for schools and educational events. Includes hands-on experiments and learning materials.',
  'available',
  87,
  '{"width": 400, "height": 200, "depth": 150}'::jsonb,
  '{"operators": 1, "setupTime": 60, "electricity": "220V, 10A", "windResistance": "Indoor only", "space": "8x8m"}'::jsonb,
  '{"base": 800, "perDay": 800, "perWeekend": 1400, "perWeek": 3500}'::jsonb,
  '[]'::jsonb,
  '["Educational materials included", "Interactive experiments", "Safety certified", "Age appropriate 6-16"]'::jsonb,
  '["schools"]'::jsonb
),
(
  'LED Light Tunnel',
  'Immersive',
  'Stunning LED tunnel creates an immersive light experience. Perfect for entrances and photo opportunities.',
  'available',
  92,
  '{"width": 300, "height": 250, "depth": 1000}'::jsonb,
  '{"operators": 2, "setupTime": 120, "electricity": "220V, 32A", "windResistance": "Indoor/covered", "space": "4x12m"}'::jsonb,
  '{"base": 2500, "perDay": 2500, "perWeekend": 4500, "perWeek": 11000}'::jsonb,
  '[]'::jsonb,
  '["RGB color control", "DMX compatible", "Modular design", "Weather resistant"]'::jsonb,
  '["festivals", "nightclub", "wedding"]'::jsonb
);

COMMENT ON TABLE installations IS 'Catalog of artistic installations available for events';
COMMENT ON COLUMN installations.media IS 'Array of media objects with type, url, title, tags';
COMMENT ON COLUMN installations.suitable_for IS 'Array of branch types: festivals, schools, wedding, nightclub';
