import dotenv from "dotenv";
import { resolve } from "path";

// Load environment variables from .env.local
dotenv.config({ path: resolve(__dirname, "../.env.local") });

import { leadsApi } from "../lib/api/leads";
import { eventsApi } from "../lib/api/events";
import { tasksApi } from "../lib/api/tasks";
import type { Lead, Event, Task } from "../types";

const sampleLeads: Omit<Lead, "id" | "createdAt" | "updatedAt">[] = [
  {
    companyName: "Urban Canvas Gallery",
    contactPerson: "Sophie Martinez",
    email: "sophie@urbancanvas.nl",
    phone: "+31 20 123 4567",
    status: "warm",
    branch: "festivals",
    temperature: "warm",
    province: "Noord-Holland",
    country: "Netherlands",
    estimatedValue: 12000,
    website: "https://urbancanvas.nl",
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
        subject: "Portfolio and Case Studies",
        content: "Sent portfolio and case studies",
        date: new Date().toISOString(),
        author: "Emma"
      }
    ],
    socialLinks: {
      instagram: "@urbancanvasgallery",
      linkedin: "urban-canvas-gallery"
    }
  },
  {
    companyName: "TechHub Rotterdam",
    contactPerson: "Mark van der Berg",
    email: "mark@techhub.nl",
    phone: "+31 10 987 6543",
    status: "reservation",
    branch: "schools",
    temperature: "hot",
    province: "Zuid-Holland",
    country: "Netherlands",
    estimatedValue: 25000,
    website: "https://techhub.nl",
    notes: [
      {
        id: "2",
        content: "Reserved for Q2 2024 - waiting for final approval from board",
        createdAt: new Date().toISOString(),
        author: "Emma",
        type: "internal"
      }
    ],
    interactions: [
      {
        id: "2",
        type: "meeting",
        subject: "Site Visit and Proposal",
        content: "Site visit completed, proposal accepted",
        date: new Date().toISOString(),
        author: "Emma"
      }
    ],
    socialLinks: {
      linkedin: "techhub-rotterdam"
    }
  },
  {
    companyName: "Café de Kunstenaar",
    contactPerson: "Lisa Jansen",
    email: "lisa@kunstenaar.nl",
    phone: "+31 30 555 1234",
    status: "cold",
    branch: "nightclub",
    temperature: "cold",
    province: "Utrecht",
    country: "Netherlands",
    estimatedValue: 8000,
    website: "https://kunstenaar.nl",
    notes: [],
    interactions: [],
    socialLinks: {
      instagram: "@cafekunstenaar"
    }
  },
  {
    companyName: "Innovation Center Eindhoven",
    contactPerson: "Peter Bakker",
    email: "peter@innovationcenter.nl",
    phone: "+31 40 222 3333",
    status: "booked",
    branch: "schools",
    temperature: "hot",
    province: "Noord-Brabant",
    country: "Netherlands",
    estimatedValue: 35000,
    website: "https://innovationcenter.nl",
    notes: [
      {
        id: "3",
        content: "Contract signed! Installation scheduled for March 2024",
        createdAt: new Date().toISOString(),
        author: "Emma",
        type: "internal"
      }
    ],
    interactions: [
      {
        id: "3",
        type: "proposal",
        subject: "Contract Signed",
        content: "Contract signed and deposit received",
        date: new Date().toISOString(),
        author: "Emma"
      }
    ],
    socialLinks: {
      linkedin: "innovation-center-eindhoven"
    }
  },
  {
    companyName: "Boutique Hotel Maastricht",
    contactPerson: "Anna Vermeer",
    email: "anna@boutiquehotel.nl",
    phone: "+31 43 888 9999",
    status: "warm",
    branch: "wedding",
    temperature: "warm",
    province: "Limburg",
    country: "Netherlands",
    estimatedValue: 18000,
    website: "https://boutiquehotel.nl",
    notes: [
      {
        id: "4",
        content: "Looking for ambient lighting for lobby and restaurant area",
        createdAt: new Date().toISOString(),
        author: "Emma",
        type: "internal"
      }
    ],
    interactions: [
      {
        id: "4",
        type: "call",
        subject: "Initial Discovery Call",
        content: "Initial discovery call - very interested",
        date: new Date().toISOString(),
        author: "Emma"
      }
    ],
    socialLinks: {
      instagram: "@boutiquehotelmaastricht"
    }
  }
];

async function seedDatabase() {
  console.log("🌱 Starting database seeding...");
  
  try {
    // Insert leads
    console.log("\n📊 Inserting sample leads...");
    for (const lead of sampleLeads) {
      const created = await leadsApi.create(lead);
      console.log(`✓ Created lead: ${created.companyName} (${created.id})`);
    }
    
    console.log("\n✅ Database seeding completed successfully!");
    console.log(`\nInserted:`);
    console.log(`- ${sampleLeads.length} leads`);
    
  } catch (error) {
    console.error("\n❌ Error seeding database:", error);
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
    console.error("\n💥 Seeding failed:", error);
    process.exit(1);
  });
