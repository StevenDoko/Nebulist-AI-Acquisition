import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function cleanupAndFinalize() {
  console.log('🧹 Cleaning up test data...\n');
  
  // Delete test installations by name
  const testNames = [
    'Large Bubble Machine',
    'Professional Bubble Machine 1000W',
    'sss'
  ];
  
  for (const name of testNames) {
    console.log(`🗑️  Deleting: ${name}`);
    const { error } = await supabase
      .from('installations')
      .delete()
      .eq('name', name);
    
    if (error) {
      console.error(`❌ Error deleting ${name}:`, error.message);
    } else {
      console.log(`✅ Deleted: ${name}`);
    }
  }
  
  console.log('\n📦 Adding final installation to reach 8 total...\n');
  
  const finalInstallation = {
    name: 'Neon Art Gallery Wall',
    type: 'Decorative',
    description: 'Customizable neon art wall featuring modern geometric designs and brand logos. Perfect for photo backdrops and corporate branding.',
    status: 'available',
    popularity: 91,
    dimensions: { width: 400, height: 300, depth: 20 },
    requirements: {
      operators: 2,
      setupTime: 90,
      electricity: '220V, 10A',
      windResistance: 'Indoor/covered',
      space: '5x4m wall space'
    },
    pricing: {
      base: 1800,
      perDay: 1800,
      perWeekend: 3200,
      perWeek: 7500
    },
    media: [],
    specifications: [
      'Custom text/logo available',
      'RGB color changing',
      'Energy efficient LED neon',
      'Modular panels',
      'Remote dimming control'
    ],
    suitable_for: ['wedding', 'nightclub', 'festivals']
  };
  
  console.log(`📦 Adding: ${finalInstallation.name}`);
  
  const { data, error } = await supabase
    .from('installations')
    .insert([finalInstallation])
    .select();
  
  if (error) {
    console.error(`❌ Error adding installation:`, error.message);
  } else {
    console.log(`✅ Successfully added: ${finalInstallation.name}`);
  }
  
  console.log('\n🔍 Final verification...\n');
  
  const { data: allInstallations, error: fetchError } = await supabase
    .from('installations')
    .select('id, name, type, status, popularity')
    .order('popularity', { ascending: false });
  
  if (fetchError) {
    console.error('❌ Error fetching installations:', fetchError.message);
    return;
  }
  
  console.log(`✅ Total installations: ${allInstallations.length}\n`);
  console.log('📋 Final Installation Catalog (sorted by popularity):\n');
  allInstallations.forEach((inst, idx) => {
    console.log(`${idx + 1}. ${inst.name}`);
    console.log(`   Type: ${inst.type} | Popularity: ${inst.popularity}`);
    console.log('');
  });
  
  console.log('✨ Cleanup complete!\n');
}

cleanupAndFinalize().catch(console.error);
