import { supabase } from "@/lib/supabase";
import type { Lead } from "@/types";

// Convert database row to Lead type
function leadRowToLead(row: any): Lead {
  return {
    id: row.id,
    companyName: row.company_name,
    contactPerson: row.contact_person,
    email: row.email,
    phone: row.phone,
    website: row.website,
    status: row.status,
    temperature: row.temperature || row.status, // fallback to status if temperature not set
    branch: row.branch,
    province: row.province,
    country: row.country,
    eventCategory: row.event_category,
    eventType: row.event_type,
    eventFrequency: row.event_frequency,
    estimatedBudget: row.estimated_budget,
    assignedTo: row.assigned_to,
    estimatedValue: row.estimated_value,
    eventDate: row.event_date,
    notes: row.notes || [],
    interactions: row.interactions || [],
    socialLinks: row.social_links || {},
    nextFollowUp: row.next_follow_up,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    // Booking fields
    reservationType: row.reservation_type,
    // Email tracking fields
    emailStatus: row.email_status,
    emailSentAt: row.email_sent_at,
    emailOpenedAt: row.email_opened_at,
    emailRespondedAt: row.email_responded_at,
    emailBouncedAt: row.email_bounced_at,
    targetGroup: row.target_group,
    // Compatibility scoring
    compatibilityScore: row.compatibility_score,
    compatibilityReason: row.compatibility_reason,
  };
}

// Convert Lead type to database row
function leadToRow(lead: Partial<Lead>) {
  return {
    company_name: lead.companyName,
    contact_person: lead.contactPerson,
    email: lead.email,
    phone: lead.phone,
    website: lead.website,
    status: lead.status,
    temperature: lead.temperature,
    branch: lead.branch,
    province: lead.province,
    country: lead.country,
    event_category: lead.eventCategory,
    event_type: lead.eventType,
    event_frequency: lead.eventFrequency,
    estimated_budget: lead.estimatedBudget,
    assigned_to: lead.assignedTo,
    estimated_value: lead.estimatedValue,
    event_date: lead.eventDate,
    notes: lead.notes,
    interactions: lead.interactions,
    social_links: lead.socialLinks,
    next_follow_up: lead.nextFollowUp,
    // Booking fields
    reservation_type: lead.reservationType,
    // Email tracking fields
    email_status: lead.emailStatus,
    email_sent_at: lead.emailSentAt,
    email_opened_at: lead.emailOpenedAt,
    email_responded_at: lead.emailRespondedAt,
    email_bounced_at: lead.emailBouncedAt,
    target_group: lead.targetGroup,
    // Compatibility scoring
    compatibility_score: lead.compatibilityScore,
    compatibility_reason: lead.compatibilityReason,
  };
}

export const leadsApi = {
  async getAll(): Promise<Lead[]> {
    const { data, error } = await supabase
      .from("leads")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return (data || []).map(leadRowToLead);
  },

  async getById(id: string): Promise<Lead | null> {
    const { data, error } = await supabase
      .from("leads")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    return data ? leadRowToLead(data) : null;
  },

  async getByBranch(branch: string): Promise<Lead[]> {
    const { data, error } = await supabase
      .from("leads")
      .select("*")
      .eq("branch", branch)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return (data || []).map(leadRowToLead);
  },

  async getByTemperatureAndBranch(temperature: string, branch: string): Promise<Lead[]> {
    const { data, error } = await supabase
      .from("leads")
      .select("*")
      .eq("temperature", temperature)
      .eq("branch", branch)
      .neq("status", "booked")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return (data || []).map(leadRowToLead);
  },

  async create(lead: Omit<Lead, "id" | "createdAt" | "updatedAt">): Promise<Lead> {
    const { data, error } = await supabase
      .from("leads")
      .insert([leadToRow(lead)])
      .select()
      .single();

    if (error) throw error;
    return leadRowToLead(data);
  },

  async update(id: string, lead: Partial<Lead>): Promise<Lead> {
    const { data, error } = await supabase
      .from("leads")
      .update(leadToRow(lead))
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return leadRowToLead(data);
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from("leads")
      .delete()
      .eq("id", id);

    if (error) throw error;
  },
};

// Legacy exports for backward compatibility
export const getLeads = leadsApi.getAll;
export const getLeadById = leadsApi.getById;
export const createLead = leadsApi.create;
export const updateLead = leadsApi.update;
export const deleteLead = leadsApi.delete;
