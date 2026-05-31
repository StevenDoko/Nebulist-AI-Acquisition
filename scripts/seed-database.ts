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

const sampleInstallations = [
  {
    name: "Giant Bubble Machine XL",
    type: "Bubble Installation",
    description: "Our flagship giant bubble machine creates massive, floating bubbles up to 2 meters in diameter. Perfect for festivals and large outdoor events.",
    status: "available",
    popularity: 95,
    dimensions: {
      width: 3,
      height: 2.5,
      depth: 2
    },
    requirements: {
      operators: 2,
      setupTime: 90,
      electricity: "220V, 16A",
      windResistance: "Max 15 km/h wind",
      space: "Minimum 5x5m clear area"
    },
    pricing: {
      perDay: 1500,
      perWeekend: 2500,
      perWeek: 5000
    },
    media: [],
    specifications: [
      "Creates bubbles up to 2m diameter",
      "Eco-friendly bubble solution included",
      "LED lighting system for night events",
      "Weather-resistant construction",
      "Remote control operation"
    ],
    suitable_for: ["festivals", "nightclub", "wedding"],
    availability: true
  },
  {
    name: "Educational Bubble Lab",
    type: "Interactive Science Installation",
    description: "Interactive bubble science station designed for schools and educational events. Includes hands-on experiments and learning materials.",
    status: "available",
    popularity: 78,
    dimensions: {
      width: 4,
      height: 2,
      depth: 3
    },
    requirements: {
      operators: 1,
      setupTime: 60,
      electricity: "220V, 10A",
      windResistance: "Indoor or covered outdoor",
      space: "Minimum 4x4m area"
    },
    pricing: {
      perDay: 800,
      perWeekend: 1400,
      perWeek: 3000
    },
    media: [],
    specifications: [
      "Multiple experiment stations",
      "Educational materials included",
      "Safe, non-toxic solutions",
      "Suitable for ages 5-15",
      "Instructor guide provided"
    ],
    suitable_for: ["schools"],
    availability: true
  },
  {
    name: "Romantic Bubble Garden",
    type: "Ambient Bubble Installation",
    description: "Elegant, romantic bubble installation perfect for weddings and intimate celebrations. Creates a magical atmosphere with gentle, floating bubbles.",
    status: "available",
    popularity: 88,
    dimensions: {
      width: 2,
      height: 1.8,
      depth: 1.5
    },
    requirements: {
      operators: 1,
      setupTime: 45,
      electricity: "220V, 6A",
      windResistance: "Max 10 km/h wind",
      space: "Minimum 3x3m area"
    },
    pricing: {
      perDay: 1200,
      perWeekend: 2000,
      perWeek: 4000
    },
    media: [],
    specifications: [
      "Elegant design aesthetic",
      "Adjustable bubble frequency",
      "Soft ambient lighting",
      "Quiet operation",
      "Customizable placement"
    ],
    suitable_for: ["wedding"],
    availability: true
  }
];

const sampleLeads = [
  {
    company_name: "Urban Canvas Gallery",
    contact_person: "Sophie Martinez",
    email: "sophie@urbancanvas.nl",
    phone: "+31 20 123 4567",
    status: "warm",
    branch: "festivals",
    province: "North Holland",
    country: "Netherlands",
    estimated_value: 12000,
    website: "https://urbancanvas.nl",
    temperature: "warm",
    notes: [
      {
        id: "1",
        content: "Interested in interactive light installation for main gallery space",
        createdAt: new Date().toISOString(),
        author: "Emma",
        type: "internal"
      }
    ],
    interactions: [
      {
        id: "1",
        type: "email",
        subject: "Initial contact",
        date: new Date().toISOString(),
        author: "Emma",
        outcome: "Sent portfolio and case studies"
      }
    ],
    social_links: {
      instagram: "@urbancanvasgallery",
      linkedin: "urban-canvas-gallery"
    }
  },
  {
    company_name: "TechHub Rotterdam",
    contact_person: "Mark van der Berg",
    email: "mark@techhub.nl",
    phone: "+31 10 987 6543",
    status: "reservation",
    branch: "rotterdam",
    province: "South Holland",
    country: "Netherlands",
    estimated_value: 25000,
    website: "https://techhub.nl",
    notes: [
      {
        id: "2",
        content: "Reserved for Q2 2024 - waiting for final approval from board",
        createdAt: new Date().toISOString(),
        author: "Emma"
      }
    ],
    interactions: [
      {
        id: "2",
        type: "meeting",
        date: new Date().toISOString(),
        notes: "Site visit completed, proposal accepted"
      }
    ],
    social_links: {
      linkedin: "techhub-rotterdam"
    }
  },
  {
    company_name: "Café de Kunstenaar",
    contact_person: "Lisa Jansen",
    email: "lisa@kunstenaar.nl",
    phone: "+31 30 555 1234",
    status: "cold",
    branch: "utrecht",
    province: "Utrecht",
    country: "Netherlands",
    estimated_value: 8000,
    website: "https://kunstenaar.nl",
    notes: [],
    interactions: [],
    social_links: {
      instagram: "@cafekunstenaar"
    }
  },
  {
    company_name: "Innovation Center Eindhoven",
    contact_person: "Peter Bakker",
    email: "peter@innovationcenter.nl",
    phone: "+31 40 222 3333",
    status: "booked",
    branch: "eindhoven",
    province: "North Brabant",
    country: "Netherlands",
    estimated_value: 35000,
    website: "https://innovationcenter.nl",
    notes: [
      {
        id: "3",
        content: "Contract signed! Installation scheduled for March 2024",
        createdAt: new Date().toISOString(),
        author: "Emma"
      }
    ],
    interactions: [
      {
        id: "3",
        type: "contract",
        date: new Date().toISOString(),
        notes: "Contract signed and deposit received"
      }
    ],
    social_links: {
      linkedin: "innovation-center-eindhoven"
    }
  },
  {
    company_name: "Boutique Hotel Maastricht",
    contact_person: "Anna Vermeer",
    email: "anna@boutiquehotel.nl",
    phone: "+31 43 888 9999",
    status: "warm",
    branch: "maastricht",
    province: "Limburg",
    country: "Netherlands",
    estimated_value: 18000,
    website: "https://boutiquehotel.nl",
    notes: [
      {
        id: "4",
        content: "Looking for ambient lighting for lobby and restaurant area",
        createdAt: new Date().toISOString(),
        author: "Emma"
      }
    ],
    interactions: [
      {
        id: "4",
        type: "call",
        date: new Date().toISOString(),
        notes: "Initial discovery call - very interested"
      }
    ],
    social_links: {
      instagram: "@boutiquehotelmaastricht"
    }
  },
  {
    company_name: "Design Studio Den Haag",
    contact_person: "Tom de Vries",
    email: "tom@designstudio.nl",
    phone: "+31 70 444 5555",
    status: "cold",
    branch: "denhaag",
    province: "South Holland",
    country: "Netherlands",
    estimated_value: 10000,
    website: "https://designstudio.nl",
    notes: [],
    interactions: [],
    social_links: {
      instagram: "@designstudiodenhaag",
      linkedin: "design-studio-den-haag"
    }
  },
  {
    company_name: "Restaurant De Lichtfabriek",
    contact_person: "Emma Bakker",
    email: "emma@lichtfabriek.nl",
    phone: "+31 20 777 8888",
    status: "reservation",
    branch: "amsterdam",
    province: "North Holland",
    country: "Netherlands",
    estimated_value: 15000,
    website: "https://lichtfabriek.nl",
    notes: [
      {
        id: "5",
        content: "Wants custom neon installation for dining area",
        createdAt: new Date().toISOString(),
        author: "Emma"
      }
    ],
    interactions: [
      {
        id: "5",
        type: "meeting",
        date: new Date().toISOString(),
        notes: "Met on-site, discussed design concepts"
      }
    ],
    social_links: {
      instagram: "@delichtfabriek"
    }
  },
  {
    company_name: "Co-working Space Utrecht",
    contact_person: "Sarah Johnson",
    email: "sarah@coworking.nl",
    phone: "+31 30 999 0000",
    status: "booked",
    branch: "utrecht",
    province: "Utrecht",
    country: "Netherlands",
    estimated_value: 20000,
    website: "https://coworking.nl",
    notes: [
      {
        id: "6",
        content: "Signed contract for full office lighting upgrade",
        createdAt: new Date().toISOString(),
        author: "Emma"
      }
    ],
    interactions: [
      {
        id: "6",
        type: "contract",
        date: new Date().toISOString(),
        notes: "50% deposit received, installation starts March 1"
      }
    ],
    social_links: {
      linkedin: "coworking-space-utrecht"
    }
  }
];

async function seedDatabase() {
  console.log("🌱 Starting database seeding...\n");
  
  try {
    // Check if data already exists
    const { data: existingLeads, error: checkError } = await supabase
      .from("leads")
      .select("id")
      .limit(1);
    
    if (checkError) {
      console.error("❌ Error checking existing data:", checkError);
      throw checkError;
    }
    
    if (existingLeads && existingLeads.length > 0) {
      console.log("⚠️  Database already contains data. Skipping seed.");
      console.log("   Run 'DELETE FROM leads; DELETE FROM installations;' in Supabase SQL Editor to clear data first.\n");
      return;
    }
    
    // Insert installations first
    console.log("📦 Inserting sample installations...");
    const { data: insertedInstallations, error: installError } = await supabase
      .from("installations")
      .insert(sampleInstallations)
      .select();
    
    if (installError) {
      console.error("❌ Error inserting installations:", installError);
      throw installError;
    }
    
    console.log(`✓ Successfully inserted ${insertedInstallations?.length || 0} installations\n`);
    
    // Insert leads
    console.log("📊 Inserting sample leads...");
    const { data: insertedLeads, error: insertError } = await supabase
      .from("leads")
      .insert(sampleLeads)
      .select();
    
    if (insertError) {
      console.error("❌ Error inserting leads:", insertError);
      throw insertError;
    }
    
    console.log(`✓ Successfully inserted ${insertedLeads?.length || 0} leads\n`);
    
    // Display summary
    console.log("✅ Database seeding completed!\n");
    console.log("Summary:");
    console.log(`- ${insertedInstallations?.length || 0} installations created`);
    console.log(`- ${insertedLeads?.length || 0} leads created`);
    console.log("\nLead status breakdown:");
    const statusCounts = insertedLeads?.reduce((acc: any, lead: any) => {
      acc[lead.status] = (acc[lead.status] || 0) + 1;
      return acc;
    }, {});
    Object.entries(statusCounts || {}).forEach(([status, count]) => {
      console.log(`  - ${status}: ${count}`);
    });
    
  } catch (error) {
    console.error("\n❌ Seeding failed:", error);
    throw error;
  }
}

// Run seeding
seedDatabase()
  .then(() => {
    console.log("\n🎉 All done!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n💥 Fatal error:", error);
    process.exit(1);
  });
