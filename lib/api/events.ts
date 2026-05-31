import { supabase } from "@/lib/supabase";
import { Event } from "@/types";

/**
 * Transform snake_case database columns to camelCase TypeScript properties
 */
function transformEventFromDb(dbEvent: any): Event {
  return {
    id: dbEvent.id,
    leadId: dbEvent.lead_id,
    name: dbEvent.name,
    description: dbEvent.description,
    eventDate: dbEvent.event_date,
    eventEndDate: dbEvent.event_end_date,
    location: dbEvent.location,
    branchId: dbEvent.branch_id,
    customerName: dbEvent.customer_name,
    customerEmail: dbEvent.customer_email,
    customerPhone: dbEvent.customer_phone,
    customerCompany: dbEvent.customer_company,
    expectedAttendees: dbEvent.expected_attendees,
    venueType: dbEvent.venue_type,
    status: dbEvent.status,
    estimatedBudget: dbEvent.estimated_budget,
    finalPrice: dbEvent.final_price,
    depositPaid: dbEvent.deposit_paid,
    notes: dbEvent.notes,
    internalNotes: dbEvent.internal_notes,
    createdAt: dbEvent.created_at,
    updatedAt: dbEvent.updated_at,
  };
}

export const eventsApi = {
  /**
   * Get all events (excluding soft deleted)
   */
  async getAll(): Promise<Event[]> {
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .order("event_date", { ascending: false });

    if (error) throw error;
    return (data || []).map(transformEventFromDb);
  },

  /**
   * Get events by status
   */
  async getByStatus(status: Event["status"]): Promise<Event[]> {
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .eq("status", status)
      .order("event_date", { ascending: false });

    if (error) throw error;
    return (data || []).map(transformEventFromDb);
  },

  /**
   * Get event by ID
   */
  async getById(id: string): Promise<Event | null> {
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null;
      throw error;
    }
    return transformEventFromDb(data);
  },

  /**
   * Create new event
   */
  async create(
    eventData: Omit<Event, "id" | "createdAt" | "updatedAt">
  ): Promise<Event> {
    const { data, error } = await supabase
      .from("events")
      .insert({
        lead_id: eventData.leadId,
        name: eventData.name,
        description: eventData.description,
        event_date: eventData.eventDate,
        event_end_date: eventData.eventEndDate,
        location: eventData.location,
        branch_id: eventData.branchId,
        customer_name: eventData.customerName,
        customer_email: eventData.customerEmail,
        customer_phone: eventData.customerPhone,
        customer_company: eventData.customerCompany,
        expected_attendees: eventData.expectedAttendees,
        venue_type: eventData.venueType,
        status: eventData.status || "inquiry",
        estimated_budget: eventData.estimatedBudget,
        final_price: eventData.finalPrice,
        deposit_paid: eventData.depositPaid,
        notes: eventData.notes,
        internal_notes: eventData.internalNotes,
      })
      .select()
      .single();

    if (error) throw error;
    return transformEventFromDb(data);
  },

  /**
   * Update event
   */
  async update(
    id: string,
    updates: Partial<Omit<Event, "id" | "createdAt" | "updatedAt">>
  ): Promise<Event> {
    const updateData: any = {};

    if (updates.leadId !== undefined) updateData.lead_id = updates.leadId;
    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.eventDate !== undefined) updateData.event_date = updates.eventDate;
    if (updates.eventEndDate !== undefined) updateData.event_end_date = updates.eventEndDate;
    if (updates.location !== undefined) updateData.location = updates.location;
    if (updates.branchId !== undefined) updateData.branch_id = updates.branchId;
    if (updates.customerName !== undefined) updateData.customer_name = updates.customerName;
    if (updates.customerEmail !== undefined) updateData.customer_email = updates.customerEmail;
    if (updates.customerPhone !== undefined) updateData.customer_phone = updates.customerPhone;
    if (updates.customerCompany !== undefined) updateData.customer_company = updates.customerCompany;
    if (updates.expectedAttendees !== undefined) updateData.expected_attendees = updates.expectedAttendees;
    if (updates.venueType !== undefined) updateData.venue_type = updates.venueType;
    if (updates.status !== undefined) updateData.status = updates.status;
    if (updates.estimatedBudget !== undefined) updateData.estimated_budget = updates.estimatedBudget;
    if (updates.finalPrice !== undefined) updateData.final_price = updates.finalPrice;
    if (updates.depositPaid !== undefined) updateData.deposit_paid = updates.depositPaid;
    if (updates.notes !== undefined) updateData.notes = updates.notes;
    if (updates.internalNotes !== undefined) updateData.internal_notes = updates.internalNotes;

    updateData.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from("events")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return transformEventFromDb(data);
  },

  /**
   * Update event status
   */
  async updateStatus(id: string, status: Event["status"]): Promise<Event> {
    const { data, error } = await supabase
      .from("events")
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return transformEventFromDb(data);
  },

  /**
   * Delete event (hard delete)
   */
  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from("events")
      .delete()
      .eq("id", id);

    if (error) throw error;
  },

  /**
   * Search events by customer name or event name
   */
  async search(query: string): Promise<Event[]> {
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .or(
        `customer_name.ilike.%${query}%,name.ilike.%${query}%,customer_company.ilike.%${query}%`
      )
      .order("event_date", { ascending: false });

    if (error) throw error;
    return (data || []).map(transformEventFromDb);
  },

  /**
   * Create event from booked lead
   */
  async createFromLead(lead: any): Promise<Event> {
    // Validate required fields
    console.log('Lead data received:', JSON.stringify(lead, null, 2));
    
    if (!lead.id) {
      throw new Error('Lead ID is required to create event');
    }
    
    if (!lead.companyName) {
      throw new Error('Company name is required to create event');
    }
    
    if (!lead.contactPerson) {
      throw new Error('Contact person is required to create event');
    }
    
    if (!lead.branch) {
      throw new Error('Branch is required to create event');
    }
    
    const eventDate = lead.eventDate || lead.nextFollowUp;
    if (!eventDate) {
      throw new Error('Event date or next follow-up date is required to create event');
    }

    // Calculate estimated budget with overflow protection
    // DECIMAL(15,2) max value is 9999999999999.99 (13 digits before decimal, 2 after)
    let estimatedBudget = null;
    if (lead.estimatedValue) {
      estimatedBudget = parseFloat(lead.estimatedValue);
    } else if (lead.estimatedBudget) {
      estimatedBudget = parseFloat(lead.estimatedBudget);
    }
    
    // Cap at max DECIMAL(15,2) value to prevent overflow
    const MAX_DECIMAL_VALUE = 9999999999999.99;
    if (estimatedBudget !== null && estimatedBudget > MAX_DECIMAL_VALUE) {
      console.warn(`Estimated budget ${estimatedBudget} exceeds DECIMAL(15,2) max. Capping at ${MAX_DECIMAL_VALUE}`);
      estimatedBudget = MAX_DECIMAL_VALUE;
    }
    
    console.log('Budget calculation:', {
      estimatedValue: lead.estimatedValue,
      estimatedBudget: lead.estimatedBudget,
      calculated: estimatedBudget
    });

    const eventData = {
      lead_id: lead.id,
      name: `${lead.companyName} - ${lead.eventType || 'Event'}`,
      description: lead.notes && lead.notes.length > 0 
        ? lead.notes.map((n: any) => n.content).join('\n') 
        : null,
      event_date: eventDate,
      event_end_date: null,
      location: lead.province ? `${lead.province}, ${lead.country}` : (lead.country || null),
      branch_id: lead.branch,
      customer_name: lead.contactPerson,
      customer_email: lead.email || null,
      customer_phone: lead.phone || null,
      customer_company: lead.companyName,
      expected_attendees: lead.expectedAttendees || null,
      venue_type: lead.reservationType || null,
      status: 'final_booking',
      estimated_budget: estimatedBudget,
      final_price: null,
      deposit_paid: null,
      notes: lead.eventType ? `Event Type: ${lead.eventType}` : null,
      internal_notes: lead.compatibilityReason || null,
    };

    console.log('Creating event with data:', JSON.stringify(eventData, null, 2));

    const { data, error } = await supabase
      .from("events")
      .insert(eventData)
      .select()
      .single();

    if (error) {
      console.error('Supabase error creating event:', JSON.stringify(error, null, 2));
      console.error('Error details:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      throw new Error(`Failed to create event: ${error.message || error.details || JSON.stringify(error)}`);
    }
    
    console.log('Event created successfully:', data);
    return transformEventFromDb(data);
  },
};

// Legacy exports for backward compatibility
export const getEvents = eventsApi.getAll;
export const getEventById = eventsApi.getById;
export const createEvent = eventsApi.create;
export const updateEvent = eventsApi.update;
export const deleteEvent = eventsApi.delete;
