"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, Button, Input, Textarea, Badge } from "@/components/ui";
import { 
  X, 
  Upload, 
  Image as ImageIcon, 
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Loader2
} from "lucide-react";
import { BranchType } from "@/types";
import { uploadFiles, isValidImageFile, isValidFileSize, formatFileSize } from "@/lib/storage";

interface UploadInstallationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
}

export function UploadInstallationModal({ isOpen, onClose, onSubmit }: UploadInstallationModalProps) {
  const [step, setStep] = useState(1);
  const [uploading, setUploading] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [uploadError, setUploadError] = useState<string>("");
  
  const [formData, setFormData] = useState({
    name: "",
    type: "",
    description: "",
    status: "available" as "available" | "booked" | "maintenance",
    dimensions: {
      width: 0,
      height: 0,
      depth: 0,
    },
    requirements: {
      operators: 1,
      setupTime: 60,
      electricity: "",
      windResistance: "",
      space: "",
    },
    pricing: {
      perDay: 0,
      perWeekend: 0,
      perWeek: 0,
    },
    specifications: [] as string[],
    suitableFor: [] as BranchType[],
  });

  const [currentSpec, setCurrentSpec] = useState("");

  const branches: { id: BranchType; label: string; color: string }[] = [
    { id: "festivals", label: "Festivals", color: "from-purple-500 to-pink-500" },
    { id: "schools", label: "Schools", color: "from-blue-500 to-cyan-500" },
    { id: "wedding", label: "Wedding", color: "from-rose-500 to-pink-500" },
    { id: "nightclub", label: "Night Club", color: "from-orange-500 to-red-500" },
  ];

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setUploadError("");
    
    try {
      // Validate files
      const fileArray = Array.from(files);
      const invalidFiles: string[] = [];
      
      fileArray.forEach((file) => {
        if (!isValidImageFile(file)) {
          invalidFiles.push(`${file.name}: Invalid file type (only JPG, PNG, GIF, WebP allowed)`);
        } else if (!isValidFileSize(file, 5)) {
          invalidFiles.push(`${file.name}: File too large (max 5MB, current: ${formatFileSize(file.size)})`);
        }
      });

      if (invalidFiles.length > 0) {
        setUploadError(invalidFiles.join(", "));
        setUploading(false);
        return;
      }

      // Upload files to Supabase Storage via API route
      const results = await uploadFiles(fileArray);
      const urls = results.map(result => result.url);
      setUploadedImages([...uploadedImages, ...urls]);
      
      // Reset file input
      e.target.value = "";
    } catch (error) {
      console.error("Upload failed:", error);
      setUploadError("Failed to upload images. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index: number) => {
    setUploadedImages(uploadedImages.filter((_, i) => i !== index));
  };

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
    const isSelected = formData.suitableFor.includes(branchId);
    setFormData({
      ...formData,
      suitableFor: isSelected
        ? formData.suitableFor.filter((b) => b !== branchId)
        : [...formData.suitableFor, branchId],
    });
  };

  const handleSubmit = () => {
    onSubmit({
      ...formData,
      media: uploadedImages.map((url, i) => ({
        id: `media-${Date.now()}-${i}`,
        type: "image",
        url,
        title: formData.name,
        tags: [formData.type],
        uploadedAt: new Date().toISOString(),
      })),
      availability: true,
      popularity: 0,
    });
    onClose();
  };

  const isStepValid = () => {
    if (step === 1) {
      return formData.name && formData.type && formData.description;
    }
    if (step === 2) {
      return uploadedImages.length > 0;
    }
    if (step === 3) {
      return formData.dimensions.width > 0 && formData.dimensions.height > 0;
    }
    if (step === 4) {
      return formData.pricing.perDay > 0;
    }
    return true;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-3xl max-h-[90vh] overflow-hidden"
            >
              <Card className="relative">
                {/* Header */}
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
                  <div>
                    <h2 className="text-2xl font-bold text-foreground">Upload New Installation</h2>
                    <p className="text-sm text-muted-foreground mt-1">
                      Step {step} of 5 - {
                        step === 1 ? "Basic Information" :
                        step === 2 ? "Media Upload" :
                        step === 3 ? "Technical Specs" :
                        step === 4 ? "Pricing" :
                        "Branch Selection"
                      }
                    </p>
                  </div>
                  <button
                    onClick={onClose}
                    className="w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center transition-colors"
                  >
                    <X className="w-5 h-5 text-muted-foreground" />
                  </button>
                </div>

                {/* Progress Bar */}
                <div className="flex gap-2 mb-6">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <div
                      key={s}
                      className={`h-1 flex-1 rounded-full transition-all ${
                        s <= step ? "bg-purple-500" : "bg-white/10"
                      }`}
                    />
                  ))}
                </div>

                {/* Content */}
                <div className="max-h-[50vh] overflow-y-auto mb-6 pr-2">
                  {/* Step 1: Basic Info */}
                  {step === 1 && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="space-y-4"
                    >
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Installation Name *
                        </label>
                        <Input
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder="e.g., LED Infinity Tunnel"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Type *
                        </label>
                        <Input
                          value={formData.type}
                          onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                          placeholder="e.g., Interactive Light Installation"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Description *
                        </label>
                        <Textarea
                          value={formData.description}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          placeholder="Describe the installation, its features, and visual impact..."
                          rows={4}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Status
                        </label>
                        <select
                          value={formData.status}
                          onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                          className="w-full rounded-lg glass border border-white/10 px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all [&>option]:bg-gray-900 [&>option]:text-white"
                        >
                          <option value="available" className="bg-gray-900 text-white">Available</option>
                          <option value="booked" className="bg-gray-900 text-white">Booked</option>
                          <option value="maintenance" className="bg-gray-900 text-white">Maintenance</option>
                        </select>
                      </div>
                    </motion.div>
                  )}

                  {/* Step 2: Media Upload */}
                  {step === 2 && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="space-y-4"
                    >
                      <div className="border-2 border-dashed border-white/20 rounded-lg p-8 text-center hover:border-purple-500/50 transition-colors">
                        <input
                          type="file"
                          id="image-upload"
                          multiple
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                        <label
                          htmlFor="image-upload"
                          className="cursor-pointer flex flex-col items-center gap-3"
                        >
                          <div className="w-16 h-16 rounded-full bg-purple-500/20 flex items-center justify-center">
                            {uploading ? (
                              <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                              >
                                <Upload className="w-8 h-8 text-purple-400" />
                              </motion.div>
                            ) : (
                              <ImageIcon className="w-8 h-8 text-purple-400" />
                            )}
                          </div>
                          <div>
                            <p className="text-foreground font-medium">
                              {uploading ? "Uploading..." : "Click to upload images"}
                            </p>
                            <p className="text-sm text-muted-foreground mt-1">
                              PNG, JPG up to 10MB
                            </p>
                          </div>
                        </label>
                      </div>

                      {uploadedImages.length > 0 && (
                        <div className="grid grid-cols-3 gap-4">
                          {uploadedImages.map((url, index) => (
                            <div key={index} className="relative group">
                              <img
                                src={url}
                                alt={`Upload ${index + 1}`}
                                className="w-full h-32 object-cover rounded-lg"
                              />
                              <button
                                onClick={() => removeImage(index)}
                                className="absolute top-2 right-2 w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <Trash2 className="w-4 h-4 text-white" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  )}

                  {/* Step 3: Technical Specs */}
                  {step === 3 && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="space-y-4"
                    >
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Dimensions (meters) *
                        </label>
                        <div className="grid grid-cols-3 gap-3">
                          <Input
                            type="number"
                            value={formData.dimensions.width ? String(formData.dimensions.width) : ""}
                            onChange={(e) => setFormData({
                              ...formData,
                              dimensions: { ...formData.dimensions, width: parseFloat(e.target.value) || 0 }
                            })}
                            placeholder="Width"
                          />
                          <Input
                            type="number"
                            value={formData.dimensions.height ? String(formData.dimensions.height) : ""}
                            onChange={(e) => setFormData({
                              ...formData,
                              dimensions: { ...formData.dimensions, height: parseFloat(e.target.value) || 0 }
                            })}
                            placeholder="Height"
                          />
                          <Input
                            type="number"
                            value={formData.dimensions.depth ? String(formData.dimensions.depth) : ""}
                            onChange={(e) => setFormData({
                              ...formData,
                              dimensions: { ...formData.dimensions, depth: parseFloat(e.target.value) || 0 }
                            })}
                            placeholder="Depth"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-2">
                            Operators Required
                          </label>
                          <Input
                            type="number"
                            value={formData.requirements.operators ? String(formData.requirements.operators) : ""}
                            onChange={(e) => setFormData({
                              ...formData,
                              requirements: { ...formData.requirements, operators: parseInt(e.target.value) || 1 }
                            })}
                            placeholder="Number of operators"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-foreground mb-2">
                            Setup Time (minutes)
                          </label>
                          <Input
                            type="number"
                            value={formData.requirements.setupTime ? String(formData.requirements.setupTime) : ""}
                            onChange={(e) => setFormData({
                              ...formData,
                              requirements: { ...formData.requirements, setupTime: parseInt(e.target.value) || 60 }
                            })}
                            placeholder="Setup time"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Electricity Requirements
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
                          placeholder="e.g., Up to 40 km/h"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Space Requirements
                        </label>
                        <Input
                          value={formData.requirements.space}
                          onChange={(e) => setFormData({
                            ...formData,
                            requirements: { ...formData.requirements, space: e.target.value }
                          })}
                          placeholder="e.g., Indoor/Outdoor, 50m² minimum"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Specifications
                        </label>
                        <div className="flex gap-2 mb-2">
                          <Input
                            value={currentSpec}
                            onChange={(e) => setCurrentSpec(e.target.value)}
                            placeholder="Add specification..."
                            onKeyPress={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                addSpecification();
                              }
                            }}
                          />
                          <Button onClick={addSpecification} size="sm">
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {formData.specifications.map((spec, index) => (
                            <Badge key={index} className="flex items-center gap-2">
                              {spec}
                              <button onClick={() => removeSpecification(index)}>
                                <X className="w-3 h-3" />
                              </button>
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Step 4: Pricing */}
                  {step === 4 && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="space-y-4"
                    >
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Price per Day (€) *
                        </label>
                        <Input
                          type="number"
                          value={formData.pricing.perDay ? String(formData.pricing.perDay) : ""}
                          onChange={(e) => setFormData({
                            ...formData,
                            pricing: { ...formData.pricing, perDay: parseFloat(e.target.value) || 0 }
                          })}
                          placeholder="Daily rate"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Price per Weekend (€)
                        </label>
                        <Input
                          type="number"
                          value={formData.pricing.perWeekend ? String(formData.pricing.perWeekend) : ""}
                          onChange={(e) => setFormData({
                            ...formData,
                            pricing: { ...formData.pricing, perWeekend: parseFloat(e.target.value) || 0 }
                          })}
                          placeholder="Weekend rate"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Price per Week (€)
                        </label>
                        <Input
                          type="number"
                          value={formData.pricing.perWeek ? String(formData.pricing.perWeek) : ""}
                          onChange={(e) => setFormData({
                            ...formData,
                            pricing: { ...formData.pricing, perWeek: parseFloat(e.target.value) || 0 }
                          })}
                          placeholder="Weekly rate"
                        />
                      </div>

                      <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                        <p className="text-sm text-purple-300">
                          💡 Tip: Weekend and weekly rates typically offer discounts compared to daily rates
                        </p>
                      </div>
                    </motion.div>
                  )}

                  {/* Step 5: Branch Selection */}
                  {step === 5 && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="space-y-4"
                    >
                      <p className="text-sm text-muted-foreground mb-4">
                        Select which branches this installation is suitable for:
                      </p>
                      <div className="grid grid-cols-2 gap-3">
                        {branches.map((branch) => (
                          <button
                            key={branch.id}
                            onClick={() => toggleBranch(branch.id)}
                            className={`p-4 rounded-lg border-2 transition-all ${
                              formData.suitableFor.includes(branch.id)
                                ? "border-purple-500 bg-purple-500/10"
                                : "border-white/10 hover:border-white/20"
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

                      {formData.suitableFor.length === 0 && (
                        <div className="flex items-start gap-3 p-4 bg-orange-500/10 border border-orange-500/20 rounded-lg">
                          <AlertCircle className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
                          <p className="text-sm text-orange-300">
                            Please select at least one branch for this installation
                          </p>
                        </div>
                      )}
                    </motion.div>
                  )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-white/10">
                  <Button
                    variant="ghost"
                    onClick={() => step > 1 ? setStep(step - 1) : onClose()}
                  >
                    {step > 1 ? "Back" : "Cancel"}
                  </Button>

                  <div className="flex gap-2">
                    {step < 5 ? (
                      <Button
                        onClick={() => setStep(step + 1)}
                        disabled={!isStepValid()}
                      >
                        Next
                      </Button>
                    ) : (
                      <Button
                        onClick={handleSubmit}
                        disabled={formData.suitableFor.length === 0}
                      >
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        Create Installation
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
