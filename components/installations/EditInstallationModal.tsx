"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, Button, Input, Textarea, Badge } from "@/components/ui";
import { X, Save, Trash2, CheckCircle2, AlertCircle, Upload, Image as ImageIcon, Loader2 } from "lucide-react";
import { BranchType, Installation, Media } from "@/types";
import { uploadFile } from "@/lib/storage";
import { installationsApi } from "@/lib/api/installations";

interface EditInstallationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  installation: Installation;
}

export function EditInstallationModal({ 
  isOpen, 
  onClose, 
  onSuccess,
  installation 
}: EditInstallationModalProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [formData, setFormData] = useState({
    name: installation.name,
    type: installation.type,
    description: installation.description || "",
    status: installation.status,
    dimensions: installation.dimensions,
    requirements: installation.requirements,
    pricing: installation.pricing,
    specifications: installation.specifications || [],
    suitableFor: installation.suitableFor || [],
    media: installation.media || [],
  });

  const [currentSpec, setCurrentSpec] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const branches: { id: BranchType; label: string; color: string }[] = [
    { id: "festivals", label: "Festivals", color: "from-purple-500 to-pink-500" },
    { id: "schools", label: "Schools", color: "from-blue-500 to-cyan-500" },
    { id: "wedding", label: "Wedding", color: "from-rose-500 to-pink-500" },
    { id: "nightclub", label: "Night Club", color: "from-orange-500 to-red-500" },
  ];

  const addSpecification = () => {
    if (currentSpec.trim()) {
      setFormData({
        ...formData,
        specifications: [...formData.specifications, currentSpec.trim()],
      });
      setCurrentSpec("");
    }
  };

  const removeSpecification = (index: number) => {
    setFormData({
      ...formData,
      specifications: formData.specifications.filter((_, i) => i !== index),
    });
  };

  const toggleBranch = (branchId: BranchType) => {
    setFormData({
      ...formData,
      suitableFor: formData.suitableFor.includes(branchId)
        ? formData.suitableFor.filter((b) => b !== branchId)
        : [...formData.suitableFor, branchId],
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setUploadError(null);

    try {
      // Delete old images from storage before uploading new ones
      if (formData.media.length > 0) {
        const { deleteFiles } = await import("@/lib/storage");
        const oldUrls = formData.media.map(m => m.url);
        try {
          await deleteFiles(oldUrls);
        } catch (err) {
          console.warn("Could not delete old images:", err);
        }
      }

      // Upload new images
      const uploadPromises = Array.from(files).map(async (file) => {
        const result = await uploadFile(file);
        const newMedia: Media = {
          id: crypto.randomUUID(),
          type: "image",
          url: result.url,
          title: file.name,
          tags: [],
          uploadedAt: new Date().toISOString(),
        };
        return newMedia;
      });

      const uploadedMedia = await Promise.all(uploadPromises);
      
      // Replace media array instead of appending
      setFormData({
        ...formData,
        media: uploadedMedia,
      });
    } catch (error) {
      console.error("Upload failed:", error);
      setUploadError(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setUploading(false);
      // Reset input
      e.target.value = "";
    }
  };

  const removeMedia = (mediaId: string) => {
    setFormData({
      ...formData,
      media: formData.media.filter((m) => m.id !== mediaId),
    });
  };

  const handleSubmit = async () => {
    setSaving(true);
    setSaveError(null);

    try {
      await installationsApi.update(installation.id, formData);
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Failed to update installation:", error);
      setSaveError(error instanceof Error ? error.message : "Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await installationsApi.delete(installation.id);
      setShowDeleteConfirm(false);
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Failed to delete installation:", error);
      alert("Failed to delete installation. Please try again.");
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-4xl max-h-[90vh] overflow-y-auto pointer-events-auto"
            >
              <Card className="bg-background-secondary border-white/10">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-white/10">
                  <div>
                    <h2 className="text-2xl font-bold text-foreground">Edit Installation</h2>
                    <p className="text-sm text-muted-foreground mt-1">
                      Update installation details
                    </p>
                  </div>
                  <button
                    onClick={onClose}
                    className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Form Content */}
                <div className="p-6 space-y-6">
                  {/* Basic Info */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-foreground">Basic Information</h3>
                    
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Installation Name
                      </label>
                      <Input
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g., Giant Bubble Machine XL"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Type
                      </label>
                      <Input
                        value={formData.type}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                        placeholder="e.g., Interactive, Educational, Immersive"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Description
                      </label>
                      <Textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Describe the installation..."
                        rows={3}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Status
                      </label>
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                        className="w-full px-4 py-2 bg-background border border-white/10 rounded-lg text-foreground"
                      >
                        <option value="available">Available</option>
                        <option value="booked">Booked</option>
                        <option value="maintenance">Maintenance</option>
                      </select>
                    </div>
                  </div>

                  {/* Dimensions */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-foreground">Dimensions (cm)</h3>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Width
                        </label>
                        <Input
                          type="number"
                          value={formData.dimensions.width.toString()}
                          onChange={(e) => setFormData({
                            ...formData,
                            dimensions: { ...formData.dimensions, width: Number(e.target.value) }
                          })}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Height
                        </label>
                        <Input
                          type="number"
                          value={formData.dimensions.height.toString()}
                          onChange={(e) => setFormData({
                            ...formData,
                            dimensions: { ...formData.dimensions, height: Number(e.target.value) }
                          })}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Depth
                        </label>
                        <Input
                          type="number"
                          value={formData.dimensions.depth.toString()}
                          onChange={(e) => setFormData({
                            ...formData,
                            dimensions: { ...formData.dimensions, depth: Number(e.target.value) }
                          })}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Pricing */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-foreground">Pricing (IDR)</h3>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Per Day
                        </label>
                        <Input
                          type="number"
                          value={formData.pricing.perDay.toString()}
                          onChange={(e) => setFormData({
                            ...formData,
                            pricing: { ...formData.pricing, perDay: Number(e.target.value) }
                          })}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Per Weekend
                        </label>
                        <Input
                          type="number"
                          value={formData.pricing.perWeekend.toString()}
                          onChange={(e) => setFormData({
                            ...formData,
                            pricing: { ...formData.pricing, perWeekend: Number(e.target.value) }
                          })}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Per Week
                        </label>
                        <Input
                          type="number"
                          value={formData.pricing.perWeek.toString()}
                          onChange={(e) => setFormData({
                            ...formData,
                            pricing: { ...formData.pricing, perWeek: Number(e.target.value) }
                          })}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Requirements */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-foreground">Requirements</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Operators
                        </label>
                        <Input
                          type="number"
                          value={formData.requirements.operators.toString()}
                          onChange={(e) => setFormData({
                            ...formData,
                            requirements: { ...formData.requirements, operators: Number(e.target.value) }
                          })}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Setup Time (minutes)
                        </label>
                        <Input
                          type="number"
                          value={formData.requirements.setupTime.toString()}
                          onChange={(e) => setFormData({
                            ...formData,
                            requirements: { ...formData.requirements, setupTime: Number(e.target.value) }
                          })}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Electricity
                        </label>
                        <Input
                          value={formData.requirements.electricity}
                          onChange={(e) => setFormData({
                            ...formData,
                            requirements: { ...formData.requirements, electricity: e.target.value }
                          })}
                          placeholder="e.g., 220V, 16A"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Wind Resistance
                        </label>
                        <Input
                          value={formData.requirements.windResistance}
                          onChange={(e) => setFormData({
                            ...formData,
                            requirements: { ...formData.requirements, windResistance: e.target.value }
                          })}
                          placeholder="e.g., Max 15 km/h"
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Space Required
                        </label>
                        <Input
                          value={formData.requirements.space}
                          onChange={(e) => setFormData({
                            ...formData,
                            requirements: { ...formData.requirements, space: e.target.value }
                          })}
                          placeholder="e.g., 10x10m"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Specifications */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-foreground">Specifications</h3>
                    <div className="flex gap-2">
                      <Input
                        value={currentSpec}
                        onChange={(e) => setCurrentSpec(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && addSpecification()}
                        placeholder="Add specification..."
                        className="flex-1"
                      />
                      <Button onClick={addSpecification}>Add</Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.specifications.map((spec, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="flex items-center gap-2"
                        >
                          {spec}
                          <button
                            onClick={() => removeSpecification(index)}
                            className="hover:text-red-400"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Media / Images */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-foreground">Images</h3>
                    
                    {/* Upload Button */}
                    <div className="relative">
                      <input
                        type="file"
                        id="image-upload"
                        accept="image/*"
                        multiple
                        onChange={handleFileUpload}
                        disabled={uploading}
                        className="hidden"
                      />
                      <label
                        htmlFor="image-upload"
                        className={`flex items-center justify-center gap-2 w-full p-4 border-2 border-dashed rounded-lg transition-all cursor-pointer ${
                          uploading
                            ? "border-white/20 bg-white/5 cursor-not-allowed"
                            : "border-white/20 bg-white/5 hover:border-purple-500 hover:bg-purple-500/10"
                        }`}
                      >
                        {uploading ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin text-purple-400" />
                            <span className="text-muted-foreground">Uploading...</span>
                          </>
                        ) : (
                          <>
                            <Upload className="w-5 h-5 text-purple-400" />
                            <span className="text-foreground">Click to upload images</span>
                            <span className="text-sm text-muted-foreground">(JPG, PNG, GIF, WebP - Max 5MB)</span>
                          </>
                        )}
                      </label>
                    </div>

                    {/* Upload Error */}
                    {uploadError && (
                      <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                        <AlertCircle className="w-4 h-4 text-red-400" />
                        <span className="text-sm text-red-400">{uploadError}</span>
                      </div>
                    )}

                    {/* Image Gallery */}
                    {formData.media.length > 0 && (
                      <div className="grid grid-cols-3 gap-4">
                        {formData.media.map((media) => (
                          <div
                            key={media.id}
                            className="relative group aspect-square rounded-lg overflow-hidden border border-white/10 bg-white/5"
                          >
                            <img
                              src={media.url}
                              alt={media.title}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <button
                                onClick={() => removeMedia(media.id)}
                                className="p-2 bg-red-500 hover:bg-red-600 rounded-lg transition-colors"
                              >
                                <Trash2 className="w-4 h-4 text-white" />
                              </button>
                            </div>
                            <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
                              <p className="text-xs text-white truncate">{media.title}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {formData.media.length === 0 && !uploading && (
                      <div className="flex flex-col items-center justify-center p-8 border border-dashed border-white/10 rounded-lg">
                        <ImageIcon className="w-12 h-12 text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground">No images uploaded yet</p>
                      </div>
                    )}
                  </div>

                  {/* Suitable For Branches */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-foreground">Suitable For</h3>
                    <div className="grid grid-cols-2 gap-3">
                      {branches.map((branch) => (
                        <button
                          key={branch.id}
                          onClick={() => toggleBranch(branch.id)}
                          className={`p-4 rounded-lg border-2 transition-all ${
                            formData.suitableFor.includes(branch.id)
                              ? "border-purple-500 bg-purple-500/10"
                              : "border-white/10 bg-white/5 hover:border-white/20"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-foreground font-medium">{branch.label}</span>
                            {formData.suitableFor.includes(branch.id) && (
                              <CheckCircle2 className="w-5 h-5 text-purple-400" />
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between p-6 border-t border-white/10">
                  <Button
                    variant="ghost"
                    onClick={() => setShowDeleteConfirm(true)}
                    className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </Button>

                  <div className="flex gap-2">
                    <Button variant="ghost" onClick={onClose}>
                      Cancel
                    </Button>
                    <Button onClick={handleSubmit}>
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>

          {/* Delete Confirmation Modal */}
          {showDeleteConfirm && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 bg-black/80"
                onClick={() => setShowDeleteConfirm(false)}
              />
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="relative bg-background-secondary border border-white/10 rounded-lg p-6 max-w-md w-full"
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-red-500/10 rounded-lg">
                    <AlertCircle className="w-6 h-6 text-red-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      Delete Installation?
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Are you sure you want to delete "{installation.name}"? This action can be undone later by an admin.
                    </p>
                    <div className="flex gap-2 justify-end">
                      <Button
                        variant="ghost"
                        onClick={() => setShowDeleteConfirm(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleDelete}
                        className="bg-red-500 hover:bg-red-600 text-white"
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </>
      )}
    </AnimatePresence>
  );
}
