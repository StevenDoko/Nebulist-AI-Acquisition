import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function verifyInstallations() {
  console.log('🔍 Verifying installations in database...\n');
  
  const { data, error } = await supabase
    .from('installations')
    .select('id, name, type, status, popularity')
    .order('created_at', { ascending: true });
  
  if (error) {
    console.error('❌ Error fetching installations:', error.message);
    return;
  }
  
  console.log(`✅ Total installations: ${data.length}\n`);
  console.log('📋 Installation Catalog:\n');
  data.forEach((inst, idx) => {
    console.log(`${idx + 1}. ${inst.name}`);
    console.log(`   Type: ${inst.type} | Status: ${inst.status} | Popularity: ${inst.popularity}`);
    console.log('');
  });
  
  console.log('✨ Done!\n');
}

verifyInstallations().catch(console.error);
