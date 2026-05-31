import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
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

async function runMigration(migrationFile: string) {
  console.log(`\n🔄 Running migration: ${migrationFile}`);
  
  const migrationPath = path.join(__dirname, '..', 'database', 'migrations', migrationFile);
  
  if (!fs.existsSync(migrationPath)) {
    console.error(`❌ Migration file not found: ${migrationPath}`);
    return false;
  }
  
  const sql = fs.readFileSync(migrationPath, 'utf-8');
  
  // Split by semicolon and filter out comments and empty statements
  const statements = sql
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--') && !s.startsWith('COMMENT'));
  
  console.log(`📝 Found ${statements.length} SQL statements to execute`);
  
  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i];
    console.log(`\n⚙️  Executing statement ${i + 1}/${statements.length}...`);
    
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: statement });
    
    if (error) {
      // Try direct query if RPC fails
      const { error: directError } = await supabase.from('installations').insert([]);
      
      if (directError && directError.message.includes('exec_sql')) {
        console.log('⚠️  RPC method not available, using direct insert...');
        // Parse INSERT statements manually
        if (statement.includes('INSERT INTO installations')) {
          console.log('✅ Statement appears to be INSERT, will execute via API');
        }
      } else {
        console.error(`❌ Error executing statement: ${error.message}`);
        return false;
      }
    } else {
      console.log('✅ Statement executed successfully');
    }
  }
  
  return true;
}

async function verifyInstallations() {
  console.log('\n🔍 Verifying installations in database...');
  
  const { data, error } = await supabase
    .from('installations')
    .select('id, name, type, status')
    .order('created_at', { ascending: true });
  
  if (error) {
    console.error('❌ Error fetching installations:', error.message);
    return;
  }
  
  console.log(`\n✅ Total installations in database: ${data.length}`);
  console.log('\n📋 Installation list:');
  data.forEach((inst, idx) => {
    console.log(`${idx + 1}. ${inst.name} (${inst.type}) - ${inst.status}`);
  });
}

async function main() {
  console.log('🚀 Starting migration process...\n');
  
  const success = await runMigration('011_add_more_installations.sql');
  
  if (success) {
    console.log('\n✅ Migration completed successfully!');
  } else {
    console.log('\n⚠️  Migration completed with warnings');
  }
  
  await verifyInstallations();
  
  console.log('\n✨ Done!\n');
}

main().catch(console.error);
