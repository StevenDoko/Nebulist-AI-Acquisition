import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ Missing Supabase credentials");
  console.error("Required: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applyMigration() {
  console.log("🔧 Testing anonymous read access to installations");
  console.log("");
  
  // The SQL to execute if needed
  const sql = `
-- Allow anonymous users to read all installations
CREATE POLICY "Anonymous users can view installations"
  ON installations
  FOR SELECT
  TO anon
  USING (deleted_at IS NULL);
  `;
  
  try {
    // Test if anonymous users can read installations
    console.log("🧪 Testing current anonymous read access...");
    const anonClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    
    const { data: installations, error: readError } = await anonClient
      .from("installations")
      .select("id, name, type, status")
      .is("deleted_at", null)
      .limit(5);
    
    if (readError) {
      console.log("❌ Anonymous read currently blocked");
      console.log("   Error:", readError.message);
      console.log("");
      console.log("📄 SQL to apply in Supabase SQL Editor:");
      console.log(sql);
      console.log("");
      console.log("👉 Go to: https://supabase.com/dashboard/project/_/sql/new");
      console.log("   Then run this script again to verify");
      process.exit(1);
    }
    
    console.log("✅ Anonymous read works!");
    console.log(`   Found ${installations?.length || 0} installations`);
    
    if (installations && installations.length > 0) {
      console.log("\n📋 Sample installations:");
      installations.forEach((inst: any) => {
        console.log(`  - ${inst.name} (${inst.type}, ${inst.status})`);
      });
    }
    
  } catch (err) {
    console.error("❌ Unexpected error:", err);
    process.exit(1);
  }
}

applyMigration();
