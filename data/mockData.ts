import { Lead, Installation, User, Event, Task, Media, EventPlanning } from "@/types";

export const mockUsers: User[] = [
  {
    id: "1",
    username: "cheesecake",
    name: "Cheesecake Milo",
    email: "willjanu6@gmail.com",
    role: "admin",
    department: "Management",
    active: true,
    createdAt: "2024-01-15"
  },
  {
    id: "2",
    username: "lucas",
    name: "Lucas Jansen",
    email: "lucas@nebulist.nl",
    role: "acquisition",
    department: "Sales & Acquisition",
    active: true,
    createdAt: "2024-03-20"
  },
  {
    id: "3",
    username: "sophie",
    name: "Sophie de Vries",
    email: "sophie@nebulist.nl",
    role: "acquisition",
    department: "Sales & Acquisition",
    active: true,
    createdAt: "2024-02-10"
  },
  {
    id: "4",
    username: "daan",
    name: "Daan Bakker",
    email: "daan@nebulist.nl",
    role: "operations",
    department: "Operations & Logistics",
    active: true,
    createdAt: "2024-01-20"
  }
];

export const mockLeads: Lead[] = [
  {
    id: "lead-1",
    companyName: "Lowlands Festival",
    contactPerson: "Pieter Vermeulen",
    email: "pieter@lowlands.nl",
    phone: "+31 20 123 4567",
    branch: "festivals",
    status: "warm",
    temperature: "hot",
    province: "Flevoland",
    country: "Netherlands",
    eventCategory: "Music Festival",
    socialLinks: {
      website: "https://lowlands.nl",
      instagram: "@lowlands",
      facebook: "lowlandsfestival"
    },
    assignedTo: "2",
    notes: [
      {
        id: "note-1",
        content: "Very interested in bubble installation for main stage area. Wants to see mockups.",
        author: "Lucas Jansen",
        createdAt: "2026-05-20T10:30:00Z",
        type: "internal"
      }
    ],
    interactions: [
      {
        id: "int-1",
        type: "email",
        subject: "Introduction: Artistic Installations for Lowlands 2026",
        date: "2026-05-15T09:00:00Z",
        author: "Lucas Jansen",
        outcome: "Positive response, requested more info"
      },
      {
        id: "int-2",
        type: "call",
        subject: "Follow-up call about installation options",
        date: "2026-05-20T14:00:00Z",
        author: "Lucas Jansen",
        outcome: "Scheduled site visit for June 5"
      }
    ],
    createdAt: "2026-05-10T08:00:00Z",
    updatedAt: "2026-05-20T14:30:00Z",
    nextFollowUp: "2026-06-05T10:00:00Z",
    estimatedValue: 15000,
    eventDate: "2026-08-20"
  },
  {
    id: "lead-2",
    companyName: "Montessori School Amsterdam",
    contactPerson: "Anna Visser",
    email: "a.visser@montessori-ams.nl",
    phone: "+31 20 987 6543",
    branch: "schools",
    status: "reservation",
    temperature: "warm",
    province: "Noord-Holland",
    country: "Netherlands",
    eventCategory: "Science Week",
    socialLinks: {
      website: "https://montessori-amsterdam.nl"
    },
    assignedTo: "3",
    notes: [
      {
        id: "note-2",
        content: "Confirmed booking for Science Week. Need to send contract and setup details.",
        author: "Sophie de Vries",
        createdAt: "2026-05-25T11:00:00Z",
        type: "internal"
      }
    ],
    interactions: [
      {
        id: "int-3",
        type: "email",
        subject: "Bubble Science for Your School Event",
        date: "2026-05-01T10:00:00Z",
        author: "Sophie de Vries"
      },
      {
        id: "int-4",
        type: "meeting",
        subject: "On-site meeting and demonstration",
        date: "2026-05-18T13:00:00Z",
        author: "Sophie de Vries",
        outcome: "Approved by school board, moving to reservation"
      }
    ],
    createdAt: "2026-04-28T09:00:00Z",
    updatedAt: "2026-05-25T11:00:00Z",
    nextFollowUp: "2026-06-01T09:00:00Z",
    estimatedValue: 3500,
    eventDate: "2026-09-15"
  },
  {
    id: "lead-3",
    companyName: "Elegant Affairs Wedding Planning",
    contactPerson: "Isabella Romano",
    email: "isabella@elegantaffairs.nl",
    phone: "+31 30 456 7890",
    branch: "wedding",
    status: "booked",
    temperature: "hot",
    province: "Utrecht",
    country: "Netherlands",
    eventCategory: "Luxury Wedding",
    socialLinks: {
      website: "https://elegantaffairs.nl",
      instagram: "@elegantaffairs_nl"
    },
    assignedTo: "2",
    notes: [
      {
        id: "note-3",
        content: "Final booking confirmed. Client wants golden hour bubble display during cocktail hour.",
        author: "Lucas Jansen",
        createdAt: "2026-05-28T15:00:00Z",
        type: "internal"
      }
    ],
    interactions: [
      {
        id: "int-5",
        type: "proposal",
        subject: "Romantic Bubble Installation Proposal",
        date: "2026-05-10T11:00:00Z",
        author: "Lucas Jansen"
      },
      {
        id: "int-6",
        type: "meeting",
        subject: "Contract signing and final details",
        date: "2026-05-28T14:00:00Z",
        author: "Lucas Jansen",
        outcome: "Contract signed, deposit received"
      }
    ],
    createdAt: "2026-05-05T10:00:00Z",
    updatedAt: "2026-05-28T16:00:00Z",
    estimatedValue: 5500,
    eventDate: "2026-07-12"
  },
  {
    id: "lead-4",
    companyName: "Paradiso Amsterdam",
    contactPerson: "Marco de Jong",
    email: "marco@paradiso.nl",
    phone: "+31 20 626 4521",
    branch: "nightclub",
    status: "warm",
    temperature: "warm",
    province: "Noord-Holland",
    country: "Netherlands",
    eventCategory: "Club Night Series",
    socialLinks: {
      website: "https://paradiso.nl",
      instagram: "@paradiso_amsterdam"
    },
    assignedTo: "2",
    notes: [
      {
        id: "note-4",
        content: "Interested in monthly installation for their electronic music nights. Discussing package deal.",
        author: "Lucas Jansen",
        createdAt: "2026-05-22T16:00:00Z",
        type: "internal"
      }
    ],
    interactions: [
      {
        id: "int-7",
        type: "email",
        subject: "Immersive Installations for Paradiso Nights",
        date: "2026-05-18T12:00:00Z",
        author: "Lucas Jansen"
      }
    ],
    createdAt: "2026-05-18T09:00:00Z",
    updatedAt: "2026-05-22T16:00:00Z",
    nextFollowUp: "2026-06-02T10:00:00Z",
    estimatedValue: 8000
  },
  {
    id: "lead-5",
    companyName: "Rotterdam City Council",
    contactPerson: "Fatima El Amrani",
    email: "f.elamrani@rotterdam.nl",
    phone: "+31 10 489 2000",
    branch: "festivals",
    status: "cold",
    temperature: "cold",
    province: "Zuid-Holland",
    country: "Netherlands",
    eventCategory: "City Activation",
    socialLinks: {
      website: "https://rotterdam.nl"
    },
    assignedTo: "3",
    notes: [],
    interactions: [
      {
        id: "int-8",
        type: "email",
        subject: "Creative Installations for Rotterdam Summer Events",
        date: "2026-05-29T09:00:00Z",
        author: "Sophie de Vries"
      }
    ],
    createdAt: "2026-05-29T08:00:00Z",
    updatedAt: "2026-05-29T09:00:00Z",
    nextFollowUp: "2026-06-12T10:00:00Z",
    estimatedValue: 12000
  }
];

export const mockInstallations: Installation[] = [
  {
    id: "inst-1",
    name: "Giant Bubble Machine XL",
    type: "Bubble Installation",
    description: "Our flagship giant bubble machine creates massive, floating bubbles up to 2 meters in diameter. Perfect for festivals and large outdoor events.",
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
    suitableFor: ["festivals", "nightclub", "wedding"],
    availability: true
  },
  {
    id: "inst-2",
    name: "Educational Bubble Lab",
    type: "Interactive Science Installation",
    description: "Interactive bubble science station designed for schools and educational events. Includes hands-on experiments and learning materials.",
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
    suitableFor: ["schools"],
    availability: true
  },
  {
    id: "inst-3",
    name: "Romantic Bubble Garden",
    type: "Ambient Bubble Installation",
    description: "Elegant, romantic bubble installation perfect for weddings and intimate celebrations. Creates a magical atmosphere with gentle, floating bubbles.",
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
    suitableFor: ["wedding"],
    availability: true
  }
];

export const mockEvents: EventPlanning[] = [
  {
    id: "event-1",
    leadId: "lead-3",
    title: "Romano-Visser Wedding",
    description: "Luxury wedding at Castle Oudaen with bubble installation during cocktail hour",
    eventDate: "2026-07-12T17:00:00Z",
    setupDate: "2026-07-12T14:00:00Z",
    teardownDate: "2026-07-12T23:00:00Z",
    location: {
      venue: "Castle Oudaen",
      address: "Oudaen 99",
      city: "Utrecht",
      province: "Utrecht",
      country: "Netherlands"
    },
    installations: ["inst-3"],
    assignedTeam: ["2", "4"],
    status: "confirmed",
    budget: 5500,
    notes: "Client wants golden hour timing (around 19:00). Backup plan for rain.",
    branch: "wedding"
  },
  {
    id: "event-2",
    leadId: "lead-2",
    title: "Montessori Science Week",
    description: "Interactive bubble science demonstrations for elementary students",
    eventDate: "2026-09-15T09:00:00Z",
    setupDate: "2026-09-15T07:30:00Z",
    teardownDate: "2026-09-15T15:00:00Z",
    location: {
      venue: "Montessori School Amsterdam",
      address: "Schoolstraat 45",
      city: "Amsterdam",
      province: "Noord-Holland",
      country: "Netherlands"
    },
    installations: ["inst-2"],
    assignedTeam: ["3", "4"],
    status: "confirmed",
    budget: 3500,
    notes: "Multiple sessions throughout the day. Need to coordinate with school schedule.",
    branch: "schools"
  }
];

export const mockTasks: Task[] = [
  {
    id: "task-1",
    title: "Send contract to Montessori School",
    description: "Prepare and send final contract with setup details",
    assignedTo: "3",
    leadId: "lead-2",
    priority: "high",
    status: "in-progress",
    dueDate: "2026-06-01T17:00:00Z",
    createdAt: "2026-05-25T11:00:00Z",
    createdBy: "3"
  },
  {
    id: "task-2",
    title: "Site visit at Lowlands Festival",
    description: "Visit festival grounds to assess installation locations",
    assignedTo: "2",
    leadId: "lead-1",
    priority: "urgent",
    status: "todo",
    dueDate: "2026-06-05T10:00:00Z",
    createdAt: "2026-05-20T14:30:00Z",
    createdBy: "2"
  },
  {
    id: "task-3",
    title: "Follow up with Paradiso",
    description: "Send package deal proposal for monthly installations",
    assignedTo: "2",
    leadId: "lead-4",
    priority: "medium",
    status: "todo",
    dueDate: "2026-06-02T10:00:00Z",
    createdAt: "2026-05-22T16:00:00Z",
    createdBy: "2"
  },
  {
    id: "task-4",
    title: "Prepare equipment for Romano wedding",
    description: "Check and prepare Romantic Bubble Garden installation",
    assignedTo: "4",
    eventId: "event-1",
    priority: "high",
    status: "todo",
    dueDate: "2026-07-10T17:00:00Z",
    createdAt: "2026-05-28T16:00:00Z",
    createdBy: "2"
  }
];
