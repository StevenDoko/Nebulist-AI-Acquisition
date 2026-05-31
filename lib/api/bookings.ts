import { supabase } from "@/lib/supabase";
import { Booking } from "@/types";

export const bookingsApi = {
  /**
   * Get all bookings for an event
   */
  async getByEventId(eventId: string): Promise<Booking[]> {
    const { data, error } = await supabase
      .from("bookings")
      .select(`
        *,
        installation:installations(*)
      `)
      .eq("event_id", eventId)
      .order("created_at", { ascending: true });

    if (error) throw error;
    return data || [];
  },

  /**
   * Get all bookings for an installation
   */
  async getByInstallationId(installationId: string): Promise<Booking[]> {
    const { data, error } = await supabase
      .from("bookings")
      .select(`
        *,
        event:events(*)
      `)
      .eq("installation_id", installationId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  },

  /**
   * Get booking by ID
   */
  async getById(id: string): Promise<Booking | null> {
    const { data, error } = await supabase
      .from("bookings")
      .select(`
        *,
        installation:installations(*),
        event:events(*)
      `)
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null;
      throw error;
    }
    return data;
  },

  /**
   * Create new booking
   */
  async create(
    bookingData: Omit<Booking, "id" | "createdAt" | "updatedAt">
  ): Promise<Booking> {
    // Calculate total_price if not provided
    const totalPrice =
      bookingData.totalPrice ||
      bookingData.quantity * bookingData.unitPrice;

    const { data, error } = await supabase
      .from("bookings")
      .insert({
        event_id: bookingData.eventId,
        installation_id: bookingData.installationId,
        quantity: bookingData.quantity,
        unit_price: bookingData.unitPrice,
        total_price: totalPrice,
        duration_days: bookingData.durationDays,
        setup_notes: bookingData.setupNotes,
        discount_amount: bookingData.discountAmount || 0,
        final_price: bookingData.finalPrice || totalPrice,
        status: bookingData.status,
        special_requirements: bookingData.specialRequirements,
      })
      .select(`
        *,
        installation:installations(*)
      `)
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Update booking
   */
  async update(
    id: string,
    updates: Partial<Omit<Booking, "id" | "createdAt" | "updatedAt" | "eventId" | "installationId">>
  ): Promise<Booking> {
    const updateData: any = {};

    if (updates.quantity !== undefined) updateData.quantity = updates.quantity;
    if (updates.unitPrice !== undefined)
      updateData.unit_price = updates.unitPrice;
    if (updates.durationDays !== undefined)
      updateData.duration_days = updates.durationDays;
    if (updates.setupNotes !== undefined) updateData.setup_notes = updates.setupNotes;
    if (updates.discountAmount !== undefined) updateData.discount_amount = updates.discountAmount;
    if (updates.finalPrice !== undefined) updateData.final_price = updates.finalPrice;
    if (updates.status !== undefined) updateData.status = updates.status;
    if (updates.specialRequirements !== undefined) updateData.special_requirements = updates.specialRequirements;

    // Recalculate total_price if quantity or unitPrice changed
    if (updates.quantity !== undefined || updates.unitPrice !== undefined) {
      // Get current booking to get missing values
      const current = await this.getById(id);
      if (current) {
        const quantity = updates.quantity ?? current.quantity;
        const unitPrice = updates.unitPrice ?? current.unitPrice;
        updateData.total_price = quantity * unitPrice;
      }
    }

    updateData.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from("bookings")
      .update(updateData)
      .eq("id", id)
      .select(`
        *,
        installation:installations(*)
      `)
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Delete booking
   */
  async delete(id: string): Promise<void> {
    const { error } = await supabase.from("bookings").delete().eq("id", id);

    if (error) throw error;
  },

  /**
   * Get total booking value for an event
   */
  async getEventTotal(eventId: string): Promise<number> {
    const { data, error } = await supabase
      .from("bookings")
      .select("total_price")
      .eq("event_id", eventId);

    if (error) throw error;

    return (data || []).reduce((sum, booking) => sum + booking.total_price, 0);
  },

  /**
   * Check if installation is available for event date
   */
  async checkAvailability(
    installationId: string,
    eventDate: string,
    durationDays: number,
    excludeEventId?: string
  ): Promise<boolean> {
    const eventStart = new Date(eventDate);
    const eventEnd = new Date(eventDate);
    eventEnd.setDate(eventEnd.getDate() + durationDays);

    // Get all bookings for this installation
    const { data, error } = await supabase
      .from("bookings")
      .select(`
        *,
        event:events!inner(event_date, status)
      `)
      .eq("installation_id", installationId)
      .neq("event.status", "cancelled");

    if (error) throw error;

    // Check for date conflicts
    for (const booking of data || []) {
      if (excludeEventId && booking.event_id === excludeEventId) continue;

      const bookingStart = new Date(booking.event.event_date);
      const bookingEnd = new Date(booking.event.event_date);
      bookingEnd.setDate(bookingEnd.getDate() + booking.duration_days);

      // Check if dates overlap
      if (eventStart < bookingEnd && eventEnd > bookingStart) {
        return false; // Conflict found
      }
    }

    return true; // Available
  },
};
