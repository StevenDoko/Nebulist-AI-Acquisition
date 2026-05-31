import { config } from "dotenv";
import { resolve } from "path";

// Load environment variables from .env.local
config({ path: resolve(__dirname, "../.env.local") });

import { supabase } from "../lib/supabase";

async function testAPI() {
  console.log("Testing Supabase connection...");
  
  try {
    // Test 1: Check connection
    const { data: healthCheck, error: healthError } = await supabase
      .from("leads")
      .select("count")
      .limit(1);
    
    if (healthError) {
      console.error("❌ Connection error:", healthError.message);
      return;
    }
    console.log("✅ Supabase connection successful");

    // Test 2: Fetch leads
    console.log("\nFetching leads...");
    const { data: leads, error: leadsError } = await supabase
      .from("leads")
      .select("*")
      .limit(5);
    
    if (leadsError) {
      console.error("❌ Error fetching leads:", leadsError.message);
      return;
    }
    
    console.log(`✅ Fetched ${leads?.length || 0} leads`);
    
    // Test 3: Check for new columns
    if (leads && leads.length > 0) {
      const firstLead = leads[0];
      console.log("\nChecking for new compatibility columns:");
      console.log("- event_type:", firstLead.event_type !== undefined ? "✅ exists" : "❌ missing");
      console.log("- event_frequency:", firstLead.event_frequency !== undefined ? "✅ exists" : "❌ missing");
      console.log("- estimated_budget:", firstLead.estimated_budget !== undefined ? "✅ exists" : "❌ missing");
      console.log("- compatibility_score:", firstLead.compatibility_score !== undefined ? "✅ exists" : "❌ missing");
      console.log("- compatibility_reason:", firstLead.compatibility_reason !== undefined ? "✅ exists" : "❌ missing");
      
      console.log("\nSample lead data:");
      console.log(JSON.stringify(firstLead, null, 2));
    }

    // Test 4: Check events
    console.log("\nFetching events...");
    const { data: events, error: eventsError } = await supabase
      .from("events")
      .select("count")
      .limit(1);
    
    if (eventsError) {
      console.error("❌ Error fetching events:", eventsError.message);
    } else {
      console.log("✅ Events table accessible");
    }

    // Test 5: Check tasks
    console.log("\nFetching tasks...");
    const { data: tasks, error: tasksError } = await supabase
      .from("tasks")
      .select("count")
      .limit(1);
    
    if (tasksError) {
      console.error("❌ Error fetching tasks:", tasksError.message);
    } else {
      console.log("✅ Tasks table accessible");
    }

  } catch (error) {
    console.error("❌ Unexpected error:", error);
  }
}

testAPI();
