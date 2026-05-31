-- Migration 011: Add more installation catalog items
-- Description: Add 4 more installations to reach 8 total catalog items
-- Created: 2026-05-31

INSERT INTO installations (name, type, description, status, popularity, dimensions, requirements, pricing, media, specifications, suitable_for) VALUES
(
  'Fog & Laser Show System',
  'Immersive',
  'Professional fog machine combined with synchronized laser light show. Creates stunning atmospheric effects for nightclubs and concerts.',
  'available',
  94,
  '{"width": 150, "height": 180, "depth": 80}'::jsonb,
  '{"operators": 2, "setupTime": 90, "electricity": "220V, 32A", "windResistance": "Indoor only", "space": "20x20m"}'::jsonb,
  '{"base": 3000, "perDay": 3000, "perWeekend": 5400, "perWeek": 13000}'::jsonb,
  '[]'::jsonb,
  '["DMX512 control", "Low-lying fog effect", "RGB laser system", "Sound activated", "Safety certified"]'::jsonb,
  '["nightclub", "festivals"]'::jsonb
),
(
  'Romantic Fairy Light Canopy',
  'Decorative',
  'Elegant overhead canopy with thousands of warm white fairy lights. Creates a magical starlit atmosphere perfect for wedding receptions.',
  'available',
  96,
  '{"width": 1000, "height": 300, "depth": 1000}'::jsonb,
  '{"operators": 3, "setupTime": 180, "electricity": "220V, 16A", "windResistance": "Indoor/covered", "space": "12x12m coverage"}'::jsonb,
  '{"base": 2000, "perDay": 2000, "perWeekend": 3600, "perWeek": 8500}'::jsonb,
  '[]'::jsonb,
  '["10,000+ LED lights", "Dimmable control", "Warm white 2700K", "Modular sections", "Fire resistant materials"]'::jsonb,
  '["wedding"]'::jsonb
),
(
  'Interactive Projection Mapping Floor',
  'Interactive',
  'Motion-reactive floor projection that responds to movement. Creates ripples, colors, and patterns as people walk across it.',
  'available',
  93,
  '{"width": 600, "height": 50, "depth": 600}'::jsonb,
  '{"operators": 2, "setupTime": 120, "electricity": "220V, 16A", "windResistance": "Indoor only", "space": "8x8m"}'::jsonb,
  '{"base": 3500, "perDay": 3500, "perWeekend": 6300, "perWeek": 15000}'::jsonb,
  '[]'::jsonb,
  '["Motion sensors included", "Multiple effect modes", "4K projection", "Custom content available", "Safe for all ages"]'::jsonb,
  '["festivals", "wedding", "nightclub"]'::jsonb
),
(
  'Science Art Installation - Plasma Globe Array',
  'Educational',
  'Array of 12 large plasma globes creating an interactive electricity art display. Educational and visually stunning for science events.',
  'available',
  88,
  '{"width": 400, "height": 200, "depth": 200}'::jsonb,
  '{"operators": 1, "setupTime": 60, "electricity": "220V, 16A", "windResistance": "Indoor only", "space": "6x6m"}'::jsonb,
  '{"base": 1200, "perDay": 1200, "perWeekend": 2100, "perWeek": 5000}'::jsonb,
  '[]'::jsonb,
  '["12 large plasma globes", "Touch interactive", "Educational signage included", "Low voltage safe", "Darkroom effect best"]'::jsonb,
  '["schools", "festivals"]'::jsonb
);

COMMENT ON TABLE installations IS 'Updated catalog with 8 artistic installations available for events';
