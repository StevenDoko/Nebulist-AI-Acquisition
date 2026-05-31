// Test script to verify database connection and data
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('🔍 Testing Supabase connection...');
console.log('URL:', supabaseUrl);
console.log('Key:', supabaseKey ? '✓ Present' : '✗ Missing');

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testDatabase() {
  try {
    // Test leads table
    console.log('\n📊 Testing leads table...');
    const { data: leads, error: leadsError } = await supabase
      .from('leads')
      .select('*');
    
    if (leadsError) {
      console.error('❌ Error fetching leads:', leadsError);
    } else {
      console.log(`✓ Found ${leads.length} leads`);
      if (leads.length > 0) {
        console.log('Sample lead:', {
          id: leads[0].id,
          company_name: leads[0].company_name,
          contact_person: leads[0].contact_person,
          status: leads[0].status,
          branch: leads[0].branch
        });
      }
    }

    // Test installations table
    console.log('\n📊 Testing installations table...');
    const { data: installations, error: installationsError } = await supabase
      .from('installations')
      .select('*');
    
    if (installationsError) {
      console.error('❌ Error fetching installations:', installationsError);
    } else {
      console.log(`✓ Found ${installations.length} installations`);
    }

    console.log('\n✅ Database test completed');
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

testDatabase();
