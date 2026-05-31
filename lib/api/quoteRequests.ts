import { supabase } from "@/lib/supabase";
import type { QuoteRequest, QuoteRequestStatus } from "@/types";

// Convert database row to QuoteRequest type
function quoteRequestRowToQuoteRequest(row: any): QuoteRequest {
  return {
    id: row.id,
    customerName: row.customer_name,
    customerEmail: row.customer_email,
    customerPhone: row.customer_phone,
    customerCompany: row.customer_company,
    eventName: row.event_name,
    eventDate: row.event_date,
    eventEndDate: row.event_end_date,
    eventLocation: row.event_location,
    expectedAttendees: row.expected_attendees,
    venueType: row.venue_type,
    branchId: row.branch_id,
    requestedInstallations: row.requested_installations || [],
    message: row.message,
    specialRequirements: row.special_requirements,
    estimatedBudget: row.estimated_budget,
    status: row.status,
    adminNotes: row.admin_notes,
    quotedPrice: row.quoted_price,
    quoteDetails: row.quote_details,
    quotedAt: row.quoted_at,
    quotedBy: row.quoted_by,
    respondedAt: row.responded_at,
    responseNotes: row.response_notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    deletedAt: row.deleted_at,
  };
}

// Convert QuoteRequest type to database row
function quoteRequestToRow(quoteRequest: Partial<QuoteRequest>) {
  return {
    customer_name: quoteRequest.customerName,
    customer_email: quoteRequest.customerEmail,
    customer_phone: quoteRequest.customerPhone,
    customer_company: quoteRequest.customerCompany,
    event_name: quoteRequest.eventName,
    event_date: quoteRequest.eventDate,
    event_end_date: quoteRequest.eventEndDate,
    event_location: quoteRequest.eventLocation,
    expected_attendees: quoteRequest.expectedAttendees,
    venue_type: quoteRequest.venueType,
    branch_id: quoteRequest.branchId,
    requested_installations: quoteRequest.requestedInstallations,
    message: quoteRequest.message,
    special_requirements: quoteRequest.specialRequirements,
    estimated_budget: quoteRequest.estimatedBudget,
    status: quoteRequest.status,
    admin_notes: quoteRequest.adminNotes,
    quoted_price: quoteRequest.quotedPrice,
    quote_details: quoteRequest.quoteDetails,
    quoted_at: quoteRequest.quotedAt,
    quoted_by: quoteRequest.quotedBy,
    responded_at: quoteRequest.respondedAt,
    response_notes: quoteRequest.responseNotes,
  };
}

export const quoteRequestsApi = {
  async getAll(): Promise<QuoteRequest[]> {
    const { data, error } = await supabase
      .from("quote_requests")
      .select("*")
      .is("deleted_at", null)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return (data || []).map(quoteRequestRowToQuoteRequest);
  },

  async getById(id: string): Promise<QuoteRequest | null> {
    const { data, error } = await supabase
      .from("quote_requests")
      .select("*")
      .eq("id", id)
      .is("deleted_at", null)
      .single();

    if (error) throw error;
    return data ? quoteRequestRowToQuoteRequest(data) : null;
  },

  async getByStatus(status: QuoteRequestStatus): Promise<QuoteRequest[]> {
    const { data, error } = await supabase
      .from("quote_requests")
      .select("*")
      .eq("status", status)
      .is("deleted_at", null)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return (data || []).map(quoteRequestRowToQuoteRequest);
  },

  async getByBranch(branchId: string): Promise<QuoteRequest[]> {
    const { data, error } = await supabase
      .from("quote_requests")
      .select("*")
      .eq("branch_id", branchId)
      .is("deleted_at", null)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return (data || []).map(quoteRequestRowToQuoteRequest);
  },

  async getByEmail(email: string): Promise<QuoteRequest[]> {
    const { data, error } = await supabase
      .from("quote_requests")
      .select("*")
      .eq("customer_email", email)
      .is("deleted_at", null)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return (data || []).map(quoteRequestRowToQuoteRequest);
  },

  async create(quoteRequest: Omit<QuoteRequest, "id" | "createdAt" | "updatedAt" | "deletedAt">): Promise<QuoteRequest> {
    const { data, error } = await supabase
      .from("quote_requests")
      .insert([quoteRequestToRow(quoteRequest)])
      .select()
      .single();

    if (error) throw error;
    return quoteRequestRowToQuoteRequest(data);
  },

  async update(id: string, quoteRequest: Partial<QuoteRequest>): Promise<QuoteRequest> {
    const { data, error } = await supabase
      .from("quote_requests")
      .update(quoteRequestToRow(quoteRequest))
      .eq("id", id)
      .is("deleted_at", null)
      .select()
      .single();

    if (error) throw error;
    return quoteRequestRowToQuoteRequest(data);
  },

  async updateStatus(id: string, status: QuoteRequestStatus, notes?: string): Promise<QuoteRequest> {
    const updateData: any = { status };
    
    if (notes) {
      updateData.admin_notes = notes;
    }

    const { data, error } = await supabase
      .from("quote_requests")
      .update(updateData)
      .eq("id", id)
      .is("deleted_at", null)
      .select()
      .single();

    if (error) throw error;
    return quoteRequestRowToQuoteRequest(data);
  },

  async addQuote(
    id: string,
    quotedPrice: number,
    quoteDetails: QuoteRequest["quoteDetails"],
    quotedBy: string
  ): Promise<QuoteRequest> {
    const { data, error } = await supabase
      .from("quote_requests")
      .update({
        status: "quoted",
        quoted_price: quotedPrice,
        quote_details: quoteDetails,
        quoted_at: new Date().toISOString(),
        quoted_by: quotedBy,
      })
      .eq("id", id)
      .is("deleted_at", null)
      .select()
      .single();

    if (error) throw error;
    return quoteRequestRowToQuoteRequest(data);
  },

  async addResponse(id: string, responseNotes: string): Promise<QuoteRequest> {
    const { data, error } = await supabase
      .from("quote_requests")
      .update({
        response_notes: responseNotes,
        responded_at: new Date().toISOString(),
      })
      .eq("id", id)
      .is("deleted_at", null)
      .select()
      .single();

    if (error) throw error;
    return quoteRequestRowToQuoteRequest(data);
  },

  async sendQuote(
    id: string,
    quotedPrice: number,
    responseNotes: string,
    adminNotes?: string
  ): Promise<QuoteRequest> {
    const updateData: any = {
      status: "quoted",
      quoted_price: quotedPrice,
      response_notes: responseNotes,
      responded_at: new Date().toISOString(),
    };

    if (adminNotes) {
      updateData.admin_notes = adminNotes;
    }

    const { data, error } = await supabase
      .from("quote_requests")
      .update(updateData)
      .eq("id", id)
      .is("deleted_at", null)
      .select()
      .single();

    if (error) throw error;
    return quoteRequestRowToQuoteRequest(data);
  },

  async delete(id: string): Promise<void> {
    // Soft delete: set deleted_at timestamp
    const { error } = await supabase
      .from("quote_requests")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", id)
      .is("deleted_at", null);

    if (error) throw error;
  },

  async restore(id: string): Promise<QuoteRequest> {
    // Restore soft-deleted quote request
    const { data, error } = await supabase
      .from("quote_requests")
      .update({ deleted_at: null })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return quoteRequestRowToQuoteRequest(data);
  },

  async permanentDelete(id: string): Promise<void> {
    // Hard delete: permanently remove from database
    const { error } = await supabase
      .from("quote_requests")
      .delete()
      .eq("id", id);

    if (error) throw error;
  },

  // Get statistics for admin dashboard
  async getStats() {
    const { data, error } = await supabase
      .from("quote_requests")
      .select("status, branch_id")
      .is("deleted_at", null);

    if (error) throw error;

    const stats = {
      total: data.length,
      pending: data.filter((q) => q.status === "pending").length,
      reviewing: data.filter((q) => q.status === "reviewing").length,
      quoted: data.filter((q) => q.status === "quoted").length,
      accepted: data.filter((q) => q.status === "accepted").length,
      rejected: data.filter((q) => q.status === "rejected").length,
      expired: data.filter((q) => q.status === "expired").length,
      byBranch: {} as Record<string, number>,
    };

    // Count by branch
    data.forEach((q) => {
      stats.byBranch[q.branch_id] = (stats.byBranch[q.branch_id] || 0) + 1;
    });

    return stats;
  },
};
