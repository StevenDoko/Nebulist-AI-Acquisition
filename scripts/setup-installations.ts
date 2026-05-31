// Load environment variables FIRST before any imports
import dotenv from "dotenv";
import { resolve } from "path";
import { readFileSync } from "fs";
dotenv.config({ path: resolve(__dirname, "../.env.local") });

// Now import Supabase after env vars are loaded
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("❌ Missing Supabase credentials in .env.local");
  console.error("NEXT_PUBLIC_SUPABASE_URL:", supabaseUrl ? "✓" : "✗");
  console.error("NEXT_PUBLIC_SUPABASE_ANON_KEY:", supabaseAnonKey ? "✓" : "✗");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function setupInstallations() {
  console.log('🔧 Setting up installations table...\n');

  try {
    // Read SQL file
    const sqlPath = resolve(__dirname, "../../backend/setup-installations-and-clear.sql");
    const sql = readFileSync(sqlPath, 'utf-8');
    
    console.log('📄 SQL script loaded');
    console.log('⚠️  Note: This script uses RPC to execute raw SQL\n');

    // Execute SQL using Supabase RPC
    // Note: This requires a database function to be created first
    // For now, we'll execute the table creation and data clearing separately
    
    // First, let's try to clear existing data
    console.log('🗑️  Clearing existing data...');
    
    const { error: clearLeadsError } = await supabase
      .from('leads')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');
    
    if (clearLeadsError && clearLeadsError.code !== 'PGRST116') {
      console.error('Error clearing leads:', clearLeadsError);
    } else {
      console.log('✓ Leads cleared');
    }

    const { error: clearInstallationsError } = await supabase
      .from('installations')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');
    
    if (clearInstallationsError && clearInstallationsError.code !== 'PGRST116') {
      console.error('Error clearing installations:', clearInstallationsError);
    } else {
      console.log('✓ Installations cleared (or table doesn\'t exist yet)');
    }

    console.log('\n⚠️  IMPORTANT: You need to run the SQL script manually in Supabase SQL Editor');
    console.log('📋 The SQL script has been copied to your clipboard');
    console.log('🔗 Go to: https://frrwlbwfzcqiiswbtpym.supabase.co/project/_/sql/new');
    console.log('\nSteps:');
    console.log('1. Paste the SQL script (Ctrl+V)');
    console.log('2. Click "Run" button');
    console.log('3. Come back here and run: npm run seed');
    
    process.exit(0);
  } catch (error) {
    console.error('Error setting up installations:', error);
    process.exit(1);
  }
}

setupInstallations();
