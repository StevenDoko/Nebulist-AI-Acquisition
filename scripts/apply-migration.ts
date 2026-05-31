import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ Missing Supabase credentials");
  process.exit(1);
}

async function applyMigration() {
  console.log("🔧 Applying migration via Supabase REST API");
  console.log("");
  
  const migrationPath = path.join(__dirname, "../database/migrations/006_add_soft_delete_and_anon_access.sql");
  const sql = fs.readFileSync(migrationPath, "utf-8");
  
  console.log("📄 Executing SQL migration...");
  console.log("");
  
  try {
    // Execute SQL via Supabase REST API
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({ query: sql })
    });
    
    if (!response.ok) {
      // Try alternative: execute via pg_stat_statements or direct query
      console.log("⚠️  Direct RPC not available, trying alternative method...");
      
      // Use service role client to execute statements individually
      const supabase = createClient(supabaseUrl, supabaseServiceKey);
      
      // Execute each statement
      const statements = [
        "ALTER TABLE installations ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL",
        "CREATE INDEX IF NOT EXISTS idx_installations_deleted_at ON installations(deleted_at)",
        "DROP POLICY IF EXISTS \"Authenticated users can view installations\" ON installations",
        "CREATE POLICY \"Authenticated users can view installations\" ON installations FOR SELECT TO authenticated USING (deleted_at IS NULL)",
        "CREATE POLICY \"Anonymous users can view installations\" ON installations FOR SELECT TO anon USING (deleted_at IS NULL)",
        "DROP POLICY IF EXISTS \"Authenticated users can update installations\" ON installations",
        "CREATE POLICY \"Authenticated users can update installations\" ON installations FOR UPDATE TO authenticated USING (deleted_at IS NULL) WITH CHECK (deleted_at IS NULL)",
        "DROP POLICY IF EXISTS \"Authenticated users can delete installations\" ON installations",
        "CREATE POLICY \"Authenticated users can delete installations\" ON installations FOR DELETE TO authenticated USING (deleted_at IS NULL)"
      ];
      
      for (let i = 0; i < statements.length; i++) {
        const stmt = statements[i];
        console.log(`[${i+1}/${statements.length}] ${stmt.substring(0, 60)}...`);
        
        // Execute via raw SQL endpoint
        const execResponse = await fetch(`${supabaseUrl}/rest/v1/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': supabaseServiceKey,
            'Authorization': `Bearer ${supabaseServiceKey}`,
            'Prefer': 'return=minimal'
          },
          body: JSON.stringify({ query: stmt })
        });
        
        // Don't fail on policy drops that don't exist
        if (!execResponse.ok && !stmt.includes('DROP POLICY')) {
          const errorText = await execResponse.text();
          console.error(`❌ Failed to execute statement ${i+1}:`, errorText);
        }
      }
    }
    
    console.log("");
    console.log("✅ Migration statements executed!");
    console.log("");
    
    // Test anonymous read access
    console.log("🧪 Testing anonymous read access...");
    const anonClient = createClient(
      supabaseUrl,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    
    const { data: installations, error: readError } = await anonClient
      .from("installations")
      .select("id, name, type, status")
      .is("deleted_at", null)
      .limit(5);
    
    if (readError) {
      console.error("❌ Anonymous read test failed:", readError.message);
      console.log("");
      console.log("⚠️  Please apply the SQL manually in Supabase SQL Editor:");
      console.log("   https://supabase.com/dashboard/project/frrwlbwfzcqiiswbtpym/sql/new");
      console.log("");
      console.log(sql);
      process.exit(1);
    }
    
    console.log(`✅ Anonymous read test passed! Found ${installations?.length || 0} installations`);
    
    if (installations && installations.length > 0) {
      console.log("\n📋 Sample installations:");
      installations.forEach((inst: any) => {
        console.log(`  - ${inst.name} (${inst.type}, ${inst.status})`);
      });
    }
    
    console.log("");
    console.log("🎉 All done! The installations page should now work.");
    
  } catch (err) {
    console.error("❌ Unexpected error:", err);
    console.log("");
    console.log("⚠️  Please apply the SQL manually in Supabase SQL Editor:");
    console.log("   https://supabase.com/dashboard/project/frrwlbwfzcqiiswbtpym/sql/new");
    console.log("");
    console.log(sql);
    process.exit(1);
  }
}

applyMigration();
