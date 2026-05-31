// Load environment variables FIRST before any imports
import dotenv from "dotenv";
import { resolve } from "path";
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

async function clearDatabase() {
  console.log('🗑️  Clearing database...\n');

  try {
    // Clear installations first (no foreign key dependencies)
    console.log('Deleting installations...');
    const { error: installationsError } = await supabase
      .from('installations')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all rows
    
    if (installationsError) {
      console.error('Error deleting installations:', installationsError);
    } else {
      console.log('✓ Installations cleared');
    }

    // Clear leads
    console.log('Deleting leads...');
    const { error: leadsError } = await supabase
      .from('leads')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all rows
    
    if (leadsError) {
      console.error('Error deleting leads:', leadsError);
    } else {
      console.log('✓ Leads cleared');
    }

    // Clear events
    console.log('Deleting events...');
    const { error: eventsError } = await supabase
      .from('events')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all rows
    
    if (eventsError) {
      console.error('Error deleting events:', eventsError);
    } else {
      console.log('✓ Events cleared');
    }

    // Clear tasks
    console.log('Deleting tasks...');
    const { error: tasksError } = await supabase
      .from('tasks')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all rows
    
    if (tasksError) {
      console.error('Error deleting tasks:', tasksError);
    } else {
      console.log('✓ Tasks cleared');
    }

    console.log('\n✅ Database cleared successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error clearing database:', error);
    process.exit(1);
  }
}

clearDatabase();
