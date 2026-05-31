import { supabase } from "@/lib/supabase";
import type { MediaAsset } from "@/types";

// Convert database row to MediaAsset type
function mediaAssetRowToMediaAsset(row: any): MediaAsset {
  return {
    id: row.id,
    name: row.name,
    type: row.type,
    branchId: row.branch_id,
    installationId: row.installation_id,
    filePath: row.file_path,
    fileSize: row.file_size,
    mimeType: row.mime_type,
    uploadedBy: row.uploaded_by,
    tags: row.tags || [],
    description: row.description,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    deletedAt: row.deleted_at,
  };
}

// Convert MediaAsset type to database row
function mediaAssetToRow(mediaAsset: Partial<MediaAsset>) {
  const row: any = {};
  
  if (mediaAsset.name !== undefined) row.name = mediaAsset.name;
  if (mediaAsset.type !== undefined) row.type = mediaAsset.type;
  if (mediaAsset.branchId !== undefined) row.branch_id = mediaAsset.branchId;
  if (mediaAsset.installationId !== undefined) row.installation_id = mediaAsset.installationId;
  if (mediaAsset.filePath !== undefined) row.file_path = mediaAsset.filePath;
  if (mediaAsset.fileSize !== undefined) row.file_size = mediaAsset.fileSize;
  if (mediaAsset.mimeType !== undefined) row.mime_type = mediaAsset.mimeType;
  if (mediaAsset.uploadedBy !== undefined) row.uploaded_by = mediaAsset.uploadedBy;
  if (mediaAsset.tags !== undefined) row.tags = mediaAsset.tags;
  if (mediaAsset.description !== undefined) row.description = mediaAsset.description;
  
  return row;
}

export const mediaAssetsApi = {
  async getAll(): Promise<MediaAsset[]> {
    const { data, error } = await supabase
      .from("media_assets")
      .select("*")
      .is("deleted_at", null)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return (data || []).map(mediaAssetRowToMediaAsset);
  },

  async getById(id: string): Promise<MediaAsset | null> {
    const { data, error } = await supabase
      .from("media_assets")
      .select("*")
      .eq("id", id)
      .is("deleted_at", null)
      .single();

    if (error) throw error;
    return data ? mediaAssetRowToMediaAsset(data) : null;
  },

  async getByBranch(branchId: string): Promise<MediaAsset[]> {
    const { data, error } = await supabase
      .from("media_assets")
      .select("*")
      .eq("branch_id", branchId)
      .is("deleted_at", null)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return (data || []).map(mediaAssetRowToMediaAsset);
  },

  async getByInstallation(installationId: string): Promise<MediaAsset[]> {
    const { data, error } = await supabase
      .from("media_assets")
      .select("*")
      .eq("installation_id", installationId)
      .is("deleted_at", null)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return (data || []).map(mediaAssetRowToMediaAsset);
  },

  async getByType(type: string): Promise<MediaAsset[]> {
    const { data, error } = await supabase
      .from("media_assets")
      .select("*")
      .eq("type", type)
      .is("deleted_at", null)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return (data || []).map(mediaAssetRowToMediaAsset);
  },

  async create(mediaAsset: Omit<MediaAsset, "id" | "createdAt" | "updatedAt" | "deletedAt">): Promise<MediaAsset> {
    const { data, error } = await supabase
      .from("media_assets")
      .insert([mediaAssetToRow(mediaAsset)])
      .select()
      .single();

    if (error) throw error;
    return mediaAssetRowToMediaAsset(data);
  },

  async update(id: string, mediaAsset: Partial<MediaAsset>): Promise<MediaAsset> {
    const { data, error } = await supabase
      .from("media_assets")
      .update(mediaAssetToRow(mediaAsset))
      .eq("id", id)
      .is("deleted_at", null)
      .select()
      .single();

    if (error) throw error;
    return mediaAssetRowToMediaAsset(data);
  },

  async delete(id: string): Promise<void> {
    // Soft delete: set deleted_at timestamp
    const { error } = await supabase
      .from("media_assets")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", id)
      .is("deleted_at", null);

    if (error) throw error;
  },

  async uploadFile(file: File, path: string): Promise<string> {
    const { data, error } = await supabase.storage
      .from("media-assets")
      .upload(path, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) throw error;
    return data.path;
  },

  async deleteFile(path: string): Promise<void> {
    const { error } = await supabase.storage
      .from("media-assets")
      .remove([path]);

    if (error) throw error;
  },

  getPublicUrl(path: string): string {
    const { data } = supabase.storage
      .from("media-assets")
      .getPublicUrl(path);

    return data.publicUrl;
  },

  async downloadFile(path: string): Promise<Blob> {
    const { data, error } = await supabase.storage
      .from("media-assets")
      .download(path);

    if (error) throw error;
    return data;
  },
};
