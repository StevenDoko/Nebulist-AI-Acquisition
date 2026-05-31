import { supabase } from "@/lib/supabase";
import type { Installation } from "@/types";

// Convert database row to Installation type
function installationRowToInstallation(row: any): Installation {
  return {
    id: row.id,
    name: row.name,
    type: row.type,
    description: row.description,
    status: row.status,
    popularity: row.popularity,
    dimensions: row.dimensions || { width: 0, height: 0, depth: 0 },
    requirements: row.requirements || { operators: 0, setupTime: 0, electricity: "", windResistance: "", space: "" },
    pricing: row.pricing || { perDay: 0, perWeekend: 0, perWeek: 0 },
    media: row.media || [],
    specifications: row.specifications || [],
    suitableFor: row.suitable_for || [],
    availability: row.availability,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// Convert Installation type to database row
function installationToRow(installation: Partial<Installation>) {
  return {
    name: installation.name,
    type: installation.type,
    description: installation.description,
    status: installation.status,
    popularity: installation.popularity,
    dimensions: installation.dimensions,
    requirements: installation.requirements,
    pricing: installation.pricing,
    media: installation.media,
    specifications: installation.specifications,
    suitable_for: installation.suitableFor,
    availability: installation.availability,
  };
}

export const installationsApi = {
  async getAll(): Promise<Installation[]> {
    const { data, error } = await supabase
      .from("installations")
      .select("*")
      .is("deleted_at", null)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return (data || []).map(installationRowToInstallation);
  },

  async getById(id: string): Promise<Installation | null> {
    const { data, error } = await supabase
      .from("installations")
      .select("*")
      .eq("id", id)
      .is("deleted_at", null)
      .single();

    if (error) throw error;
    return data ? installationRowToInstallation(data) : null;
  },

  async getByBranch(branch: string): Promise<Installation[]> {
    const { data, error } = await supabase
      .from("installations")
      .select("*")
      .eq("branch", branch)
      .is("deleted_at", null)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return (data || []).map(installationRowToInstallation);
  },

  async getByStatus(status: string): Promise<Installation[]> {
    const { data, error } = await supabase
      .from("installations")
      .select("*")
      .eq("status", status)
      .is("deleted_at", null)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return (data || []).map(installationRowToInstallation);
  },

  async create(installation: Omit<Installation, "id" | "createdAt" | "updatedAt">): Promise<Installation> {
    const { data, error } = await supabase
      .from("installations")
      .insert([installationToRow(installation)])
      .select()
      .single();

    if (error) throw error;
    return installationRowToInstallation(data);
  },

  async update(id: string, installation: Partial<Installation>): Promise<Installation> {
    const { data, error } = await supabase
      .from("installations")
      .update(installationToRow(installation))
      .eq("id", id)
      .is("deleted_at", null)
      .select()
      .single();

    if (error) throw error;
    return installationRowToInstallation(data);
  },

  async delete(id: string): Promise<void> {
    // Soft delete: set deleted_at timestamp
    const { error } = await supabase
      .from("installations")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", id)
      .is("deleted_at", null);

    if (error) throw error;
  },

  async softDelete(id: string): Promise<void> {
    // Alias for delete (soft delete)
    return this.delete(id);
  },

  async restore(id: string): Promise<Installation> {
    // Restore soft-deleted installation
    const { data, error } = await supabase
      .from("installations")
      .update({ deleted_at: null })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return installationRowToInstallation(data);
  },

  async permanentDelete(id: string): Promise<void> {
    // Hard delete: permanently remove from database
    const { error } = await supabase
      .from("installations")
      .delete()
      .eq("id", id);

    if (error) throw error;
  },
};

// Legacy exports for backward compatibility
export const getInstallations = installationsApi.getAll;
export const getInstallationById = installationsApi.getById;
export const createInstallation = installationsApi.create;
export const updateInstallation = installationsApi.update;
export const deleteInstallation = installationsApi.delete;
export const softDeleteInstallation = installationsApi.softDelete;
