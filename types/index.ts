// Branch Types
export type BranchType = "festivals" | "schools" | "wedding" | "nightclub";

// Lead Status
export type LeadStatus = "cold" | "warm" | "reservation" | "booked";

// Lead Temperature
export type LeadTemperature = "cold" | "warm" | "hot";

// Email Tracking Status
export type EmailStatus = "not_sent" | "email_sent" | "email_opened" | "responded" | "bounced";

// Event Status
export type EventStatus = "inquiry" | "warm_lead" | "reservation" | "final_booking" | "completed" | "cancelled";

// Booking Status
export type BookingStatus = "pending" | "confirmed" | "cancelled" | "completed";

// Quote Request Status
export type QuoteRequestStatus = "pending" | "reviewing" | "quoted" | "accepted" | "rejected" | "expired";

// User Roles
export type UserRole = "admin" | "acquisition" | "operations" | "creative";

// User Interface for Authentication and User Management
export interface User {
  id: string;
  username: string;
  name: string;
  email: string;
  role: UserRole;
  department?: string;
  avatar?: string;
  active: boolean;
  createdAt: string;
}

// Branch Configuration
export interface BranchConfig {
  id: BranchType;
  name: string;
  icon: string;
  color: string;
  gradient: string;
  description: string;
  tone: string;
  visualStyle: string;
  targetAudience: string;
  website: string;
  outreachStrategy?: {
    tone: string;
    hooks: string[];
    painPoints: string[];
    cta: string[];
  };
}

// Export Branch as alias for BranchConfig
export type Branch = BranchConfig;

// Lead Interface
export interface Lead {
  id: string;
  companyName: string;
  contactPerson: string;
  email: string;
  phone?: string;
  website?: string;
  branch: BranchType;
  status: LeadStatus;
  temperature: LeadTemperature;
  province?: string;
  country: string;
  eventCategory?: string;
  socialLinks?: {
    linkedin?: string;
    instagram?: string;
    facebook?: string;
    website?: string;
  };
  assignedTo?: string;
  notes: Note[];
  interactions: Interaction[];
  createdAt: string;
  updatedAt: string;
  nextFollowUp?: string;
  estimatedValue?: number;
  eventDate?: string;
  eventType?: string; // Type of event (e.g., "Music Festival", "School Event")
  eventFrequency?: string; // How often events occur (e.g., "Annual", "Monthly")
  estimatedBudget?: string; // Budget range (e.g., "€50,000 - €100,000")
  // Booking fields
  reservationType?: string; // Type of reservation (e.g., "Wedding", "Corporate Event")
  // Email tracking fields
  emailStatus?: EmailStatus;
  emailSentAt?: string;
  emailOpenedAt?: string;
  emailRespondedAt?: string;
  emailBouncedAt?: string;
  targetGroup?: string; // Doelgroep from Excel
  // Compatibility scoring
  compatibilityScore?: number; // 0-100% match score for event-machine compatibility
  compatibilityReason?: string; // AI-generated reason for compatibility score
}

// Note Interface
export interface Note {
  id: string;
  content: string;
  author: string;
  createdAt: string;
  type: "internal" | "client";
}

// Interaction Interface
export interface Interaction {
  id: string;
  type: "email" | "call" | "meeting" | "proposal" | "follow-up";
  subject: string;
  content?: string;
  date: string;
  author: string;
  outcome?: string;
}

// Installation Interface
export interface Installation {
  id: string;
  name: string;
  type: string;
  description: string;
  status?: "available" | "booked" | "maintenance";
  popularity?: number;
  dimensions: {
    width: number;
    height: number;
    depth: number;
  };
  requirements: {
    operators: number;
    setupTime: number; // in minutes
    electricity: string;
    windResistance: string;
    space: string;
  };
  operators?: number;
  setupTime?: number;
  powerRequirement?: string;
  operatorRequired?: boolean;
  pricing: {
    base?: number;
    perDay: number;
    perWeekend: number;
    perWeek: number;
  };
  media: Media[];
  specifications: string[];
  suitableFor: BranchType[];
  availability: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// Media Interface
export interface Media {
  id: string;
  type: "image" | "video";
  url: string;
  thumbnail?: string;
  title: string;
  description?: string;
  tags: string[];
  uploadedAt: string;
}

// Outreach Template Interface
export interface OutreachTemplate {
  id: string;
  name: string;
  branch: BranchType;
  type: "introduction" | "follow-up" | "proposal" | "newsletter";
  subject: string;
  content: string;
  tone: string;
  variables: string[];
  createdAt: string;
  usageCount: number;
}

// Event Planning Interface (for internal event management)
export interface EventPlanning {
  id: string;
  leadId: string;
  name?: string;
  title: string;
  description: string;
  date?: string;
  eventDate: string;
  setupDate: string;
  teardownDate: string;
  location: {
    venue: string;
    address: string;
    city: string;
    province: string;
    country: string;
  };
  installations: string[]; // Installation IDs
  assignedTeam: string[]; // User IDs
  attendees?: number;
  status: "planned" | "confirmed" | "in-progress" | "completed" | "cancelled" | "tentative";
  budget: number;
  actualCost?: number;
  notes: string;
  branch: BranchType;
}

// Event Interface (for customer event inquiries and bookings)
export interface Event {
  id: string;
  leadId?: string; // Reference to CRM lead if this event was created from a lead booking
  name: string;
  description?: string;
  eventDate: string;
  eventEndDate?: string;
  location?: string;
  branchId: string;
  
  // Customer information
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  customerCompany?: string;
  
  // Event details
  expectedAttendees?: number;
  venueType?: string;
  
  // Status tracking
  status: EventStatus;
  
  // Financial
  estimatedBudget?: number;
  finalPrice?: number;
  depositPaid?: number;
  
  // Additional info
  notes?: string;
  internalNotes?: string;
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
}

// Booking Interface (junction table between events and installations)
export interface Booking {
  id: string;
  eventId: string;
  installationId: string;
  quantity: number;
  durationDays: number;
  unitPrice: number;
  totalPrice: number;
  discountAmount: number;
  finalPrice: number;
  status: BookingStatus;
  setupNotes?: string;
  specialRequirements?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

// Quote Request Interface
export interface QuoteRequest {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  customerCompany?: string;
  eventName?: string;
  eventDate?: string;
  eventEndDate?: string;
  eventLocation?: string;
  expectedAttendees?: number;
  venueType?: string;
  branchId: string;
  requestedInstallations: Array<{
    installationId: string;
    quantity: number;
    durationDays: number;
  }>;
  message?: string;
  specialRequirements?: string;
  estimatedBudget?: number;
  status: QuoteRequestStatus;
  adminNotes?: string;
  quotedPrice?: number;
  quoteDetails?: {
    items: Array<{
      installationId: string;
      name: string;
      quantity: number;
      unitPrice: number;
      totalPrice: number;
    }>;
    subtotal: number;
    tax: number;
    total: number;
    validUntil: string;
  };
  quotedAt?: string;
  quotedBy?: string;
  respondedAt?: string;
  responseNotes?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

// Task Interface
export interface Task {
  id: string;
  title: string;
  description: string;
  assignedTo: string;
  leadId?: string;
  eventId?: string;
  priority: "low" | "medium" | "high" | "urgent";
  status: "todo" | "in-progress" | "review" | "completed";
  dueDate: string;
  createdAt: string;
  createdBy: string;
}

// AI Outreach Request
export interface AIOutreachRequest {
  leadId: string;
  branch: BranchType;
  type: "introduction" | "follow-up" | "proposal";
  context?: string;
  installationIds?: string[];
  tone?: string;
}

// AI Outreach Response
export interface AIOutreachResponse {
  subject: string;
  content: string;
  tone: string;
  suggestedMedia: string[];
  followUpDate: string;
  tips: string[];
}

// Dashboard Stats
export interface DashboardStats {
  totalLeads: number;
  coldLeads: number;
  warmLeads: number;
  reservations: number;
  bookings: number;
  upcomingEvents: number;
  revenue: {
    current: number;
    projected: number;
    growth: number;
  };
  byBranch: {
    [key in BranchType]: {
      leads: number;
      bookings: number;
      revenue: number;
    };
  };
}

// Season Planning
export interface Season {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  targetBranches: BranchType[];
  targetRevenue: number;
  actualRevenue: number;
  events: string[]; // Event IDs
  status: "planning" | "active" | "completed";
}

// Media Asset Types
export type MediaType = "image" | "video" | "document" | "general";

export interface MediaAsset {
  id: string;
  name: string;
  type: MediaType;
  branchId: string;
  installationId?: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  uploadedBy: string;
  tags: string[];
  description?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}
