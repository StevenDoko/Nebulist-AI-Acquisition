import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const newInstallations = [
  {
    name: 'Fog & Laser Show System',
    type: 'Immersive',
    description: 'Professional fog machine combined with synchronized laser light show. Creates stunning atmospheric effects for nightclubs and concerts.',
    status: 'available',
    popularity: 94,
    dimensions: { width: 150, height: 180, depth: 80 },
    requirements: {
      operators: 2,
      setupTime: 90,
      electricity: '220V, 32A',
      windResistance: 'Indoor only',
      space: '20x20m'
    },
    pricing: {
      base: 3000,
      perDay: 3000,
      perWeekend: 5400,
      perWeek: 13000
    },
    media: [],
    specifications: [
      'DMX512 control',
      'Low-lying fog effect',
      'RGB laser system',
      'Sound activated',
      'Safety certified'
    ],
    suitable_for: ['nightclub', 'festivals']
  },
  {
    name: 'Romantic Fairy Light Canopy',
    type: 'Decorative',
    description: 'Elegant overhead canopy with thousands of warm white fairy lights. Creates a magical starlit atmosphere perfect for wedding receptions.',
    status: 'available',
    popularity: 96,
    dimensions: { width: 1000, height: 300, depth: 1000 },
    requirements: {
      operators: 3,
      setupTime: 180,
      electricity: '220V, 16A',
      windResistance: 'Indoor/covered',
      space: '12x12m coverage'
    },
    pricing: {
      base: 2000,
      perDay: 2000,
      perWeekend: 3600,
      perWeek: 8500
    },
    media: [],
    specifications: [
      '10,000+ LED lights',
      'Dimmable control',
      'Warm white 2700K',
      'Modular sections',
      'Fire resistant materials'
    ],
    suitable_for: ['wedding']
  },
  {
    name: 'Interactive Projection Mapping Floor',
    type: 'Interactive',
    description: 'Motion-reactive floor projection that responds to movement. Creates ripples, colors, and patterns as people walk across it.',
    status: 'available',
    popularity: 93,
    dimensions: { width: 600, height: 50, depth: 600 },
    requirements: {
      operators: 2,
      setupTime: 120,
      electricity: '220V, 16A',
      windResistance: 'Indoor only',
      space: '8x8m'
    },
    pricing: {
      base: 3500,
      perDay: 3500,
      perWeekend: 6300,
      perWeek: 15000
    },
    media: [],
    specifications: [
      'Motion sensors included',
      'Multiple effect modes',
      '4K projection',
      'Custom content available',
      'Safe for all ages'
    ],
    suitable_for: ['festivals', 'wedding', 'nightclub']
  },
  {
    name: 'Science Art Installation - Plasma Globe Array',
    type: 'Educational',
    description: 'Array of 12 large plasma globes creating an interactive electricity art display. Educational and visually stunning for science events.',
    status: 'available',
    popularity: 88,
    dimensions: { width: 400, height: 200, depth: 200 },
    requirements: {
      operators: 1,
      setupTime: 60,
      electricity: '220V, 16A',
      windResistance: 'Indoor only',
      space: '6x6m'
    },
    pricing: {
      base: 1200,
      perDay: 1200,
      perWeekend: 2100,
      perWeek: 5000
    },
    media: [],
    specifications: [
      '12 large plasma globes',
      'Touch interactive',
      'Educational signage included',
      'Low voltage safe',
      'Darkroom effect best'
    ],
    suitable_for: ['schools', 'festivals']
  }
];

async function addInstallations() {
  console.log('🚀 Adding 4 new installations to database...\n');
  
  for (const installation of newInstallations) {
    console.log(`📦 Adding: ${installation.name}`);
    
    const { data, error } = await supabase
      .from('installations')
      .insert([installation])
      .select();
    
    if (error) {
      console.error(`❌ Error adding ${installation.name}:`, error.message);
    } else {
      console.log(`✅ Successfully added: ${installation.name}`);
    }
  }
  
  console.log('\n🔍 Verifying total installations...');
  
  const { data, error } = await supabase
    .from('installations')
    .select('id, name, type, status')
    .is('deleted_at', null)
    .order('created_at', { ascending: true });
  
  if (error) {
    console.error('❌ Error fetching installations:', error.message);
    return;
  }
  
  console.log(`\n✅ Total active installations: ${data.length}`);
  console.log('\n📋 Installation catalog:');
  data.forEach((inst, idx) => {
    console.log(`${idx + 1}. ${inst.name} (${inst.type})`);
  });
  
  console.log('\n✨ Done!\n');
}

addInstallations().catch(console.error);
