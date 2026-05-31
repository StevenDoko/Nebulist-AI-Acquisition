/**
 * Upload file to Supabase Storage via API route (server-side)
 * @param file - File to upload
 * @returns Upload result with URL
 */
export async function uploadFile(file: File): Promise<{
  url: string;
  path: string;
  filename: string;
  size: number;
  type: string;
}> {
  try {
    // Validate file type
    if (!isValidImageFile(file)) {
      throw new Error("Invalid file type. Only JPG, PNG, GIF, and WebP are allowed.");
    }

    // Validate file size
    if (!isValidFileSize(file)) {
      throw new Error("File too large. Maximum size is 5MB.");
    }

    // Create form data
    const formData = new FormData();
    formData.append("file", file);

    // Upload via API route
    const response = await fetch("/api/storage/upload", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Upload failed");
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Failed to upload file:", error);
    throw error;
  }
}

/**
 * Upload multiple files to Supabase Storage via API route
 * @param files - Array of files to upload
 * @returns Array of upload results with URLs
 */
export async function uploadFiles(files: File[]): Promise<Array<{
  url: string;
  path: string;
  filename: string;
  size: number;
  type: string;
}>> {
  try {
    const uploadPromises = files.map((file) => uploadFile(file));
    return await Promise.all(uploadPromises);
  } catch (error) {
    console.error("Failed to upload files:", error);
    throw error;
  }
}

/**
 * Delete file from Supabase Storage via API route
 * @param url - Public URL of file to delete
 */
export async function deleteFile(url: string): Promise<void> {
  try {
    const response = await fetch("/api/storage/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Delete failed");
    }
  } catch (error) {
    console.error("Failed to delete file:", error);
    throw error;
  }
}

/**
 * Delete multiple files from Supabase Storage via API route
 * @param urls - Array of public URLs to delete
 */
export async function deleteFiles(urls: string[]): Promise<void> {
  try {
    const deletePromises = urls.map((url) => deleteFile(url));
    await Promise.all(deletePromises);
  } catch (error) {
    console.error("Failed to delete files:", error);
    throw error;
  }
}

/**
 * Get file size in human-readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
}

/**
 * Validate file type
 */
export function isValidImageFile(file: File): boolean {
  const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];
  return validTypes.includes(file.type);
}

/**
 * Validate file size (max 5MB)
 */
export function isValidFileSize(file: File, maxSizeMB: number = 5): boolean {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  return file.size <= maxSizeBytes;
}
