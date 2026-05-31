"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, Button, Input, Textarea } from "@/components/ui";
import { X, Send, Plus, Trash2, AlertCircle, CheckCircle2 } from "lucide-react";
import { BranchType, Installation } from "@/types";
import { quoteRequestsApi } from "@/lib/api/quoteRequests";

interface RequestQuoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  preSelectedInstallations?: Installation[];
}

interface RequestedInstallation {
  installationId: string;
  installationName: string;
  quantity: number;
  durationDays: number;
}

export function RequestQuoteModal({ 
  isOpen, 
  onClose,
  preSelectedInstallations = []
}: RequestQuoteModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    customerCompany: "",
    eventName: "",
    eventDate: "",
    eventEndDate: "",
    eventLocation: "",
    expectedAttendees: "",
    venueType: "",
    branchId: "" as BranchType | "",
    message: "",
    specialRequirements: "",
    estimatedBudget: "",
  });

  const [requestedInstallations, setRequestedInstallations] = useState<RequestedInstallation[]>(
    preSelectedInstallations.map(inst => ({
      installationId: inst.id,
      installationName: inst.name,
      quantity: 1,
      durationDays: 1,
    }))
  );

  const branches: { id: BranchType; label: string; description: string }[] = [
    { id: "festivals", label: "Festivals", description: "Music festivals, outdoor events" },
    { id: "schools", label: "Schools", description: "School events, educational programs" },
    { id: "wedding", label: "Wedding", description: "Wedding ceremonies and receptions" },
    { id: "nightclub", label: "Night Club", description: "Club events, parties" },
  ];

  const venueTypes = [
    "Indoor Venue",
    "Outdoor Venue",
    "Tent/Marquee",
    "Hotel/Ballroom",
    "Garden/Park",
    "Beach",
    "Warehouse",
    "Other",
  ];

  const updateInstallation = (index: number, field: keyof RequestedInstallation, value: any) => {
    const updated = [...requestedInstallations];
    updated[index] = { ...updated[index], [field]: value };
    setRequestedInstallations(updated);
  };

  const removeInstallation = (index: number) => {
    setRequestedInstallations(requestedInstallations.filter((_, i) => i !== index));
  };

  const validateForm = (): string | null => {
    if (!formData.customerName.trim()) return "Customer name is required";
    if (!formData.customerEmail.trim()) return "Customer email is required";
    if (!formData.customerEmail.includes("@")) return "Valid email is required";
    if (!formData.branchId) return "Please select an event type";
    if (requestedInstallations.length === 0) return "Please select at least one installation";
    
    // Validate installations
    for (const inst of requestedInstallations) {
      if (inst.quantity < 1) return "Installation quantity must be at least 1";
      if (inst.durationDays < 1) return "Duration must be at least 1 day";
    }

    return null;
  };

  const handleSubmit = async () => {
    const validationError = validateForm();
    if (validationError) {
      setSubmitError(validationError);
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      await quoteRequestsApi.create({
        customerName: formData.customerName,
        customerEmail: formData.customerEmail,
        customerPhone: formData.customerPhone || undefined,
        customerCompany: formData.customerCompany || undefined,
        eventName: formData.eventName || undefined,
        eventDate: formData.eventDate || undefined,
        eventEndDate: formData.eventEndDate || undefined,
        eventLocation: formData.eventLocation || undefined,
        expectedAttendees: formData.expectedAttendees ? parseInt(formData.expectedAttendees) : undefined,
        venueType: formData.venueType || undefined,
        branchId: formData.branchId as string,
        requestedInstallations: requestedInstallations.map(inst => ({
          installationId: inst.installationId,
          quantity: inst.quantity,
          durationDays: inst.durationDays,
        })),
        message: formData.message || undefined,
        specialRequirements: formData.specialRequirements || undefined,
        estimatedBudget: formData.estimatedBudget ? parseFloat(formData.estimatedBudget) : undefined,
        status: "pending",
      });

      setSubmitSuccess(true);
      
      // Close modal after 2 seconds
      setTimeout(() => {
        onClose();
        // Reset form
        setSubmitSuccess(false);
        setFormData({
          customerName: "",
          customerEmail: "",
          customerPhone: "",
          customerCompany: "",
          eventName: "",
          eventDate: "",
          eventEndDate: "",
          eventLocation: "",
          expectedAttendees: "",
          venueType: "",
          branchId: "",
          message: "",
          specialRequirements: "",
          estimatedBudget: "",
        });
        setRequestedInstallations([]);
      }, 2000);
    } catch (error) {
      console.error("Error submitting quote request:", error);
      setSubmitError("Failed to submit quote request. Please try again.");
    } finally {
      setIsSubmitting(false);
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
                    <h2 className="text-2xl font-bold text-foreground">Request a Quote</h2>
                    <p className="text-sm text-muted-foreground mt-1">
                      Tell us about your event and we'll get back to you with a custom quote
                    </p>
                  </div>
                  <button
                    onClick={onClose}
                    className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Success Message */}
                {submitSuccess && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="m-6 p-4 bg-green-500/10 border border-green-500/20 rounded-lg flex items-center gap-3"
                  >
                    <CheckCircle2 className="w-5 h-5 text-green-400" />
                    <div>
                      <p className="text-sm font-medium text-green-400">Quote request submitted successfully!</p>
                      <p className="text-xs text-green-400/70 mt-1">We'll get back to you within 24 hours.</p>
                    </div>
                  </motion.div>
                )}

                {/* Error Message */}
                {submitError && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="m-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-3"
                  >
                    <AlertCircle className="w-5 h-5 text-red-400" />
                    <p className="text-sm text-red-400">{submitError}</p>
                  </motion.div>
                )}

                <div className="p-6 space-y-6">
                  {/* Customer Information */}
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-4">Your Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Full Name *
                        </label>
                        <Input
                          value={formData.customerName}
                          onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                          placeholder="John Doe"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Email *
                        </label>
                        <Input
                          type="email"
                          value={formData.customerEmail}
                          onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                          placeholder="john@example.com"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Phone
                        </label>
                        <Input
                          type="tel"
                          value={formData.customerPhone}
                          onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                          placeholder="+31 6 12345678"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Company/Organization
                        </label>
                        <Input
                          value={formData.customerCompany}
                          onChange={(e) => setFormData({ ...formData, customerCompany: e.target.value })}
                          placeholder="Company Name"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Event Type Selection */}
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-4">Event Type *</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {branches.map((branch) => (
                        <button
                          key={branch.id}
                          onClick={() => setFormData({ ...formData, branchId: branch.id })}
                          className={`p-4 rounded-lg border-2 transition-all ${
                            formData.branchId === branch.id
                              ? "border-primary bg-primary/10"
                              : "border-white/10 hover:border-white/20 bg-white/5"
                          }`}
                        >
                          <p className="font-medium text-sm">{branch.label}</p>
                          <p className="text-xs text-muted-foreground mt-1">{branch.description}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Event Details */}
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-4">Event Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Event Name
                        </label>
                        <Input
                          value={formData.eventName}
                          onChange={(e) => setFormData({ ...formData, eventName: e.target.value })}
                          placeholder="Summer Music Festival"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Event Date
                        </label>
                        <Input
                          type="date"
                          value={formData.eventDate}
                          onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Event End Date
                        </label>
                        <Input
                          type="date"
                          value={formData.eventEndDate}
                          onChange={(e) => setFormData({ ...formData, eventEndDate: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Expected Attendees
                        </label>
                        <Input
                          type="number"
                          value={formData.expectedAttendees}
                          onChange={(e) => setFormData({ ...formData, expectedAttendees: e.target.value })}
                          placeholder="500"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Event Location
                        </label>
                        <Input
                          value={formData.eventLocation}
                          onChange={(e) => setFormData({ ...formData, eventLocation: e.target.value })}
                          placeholder="Amsterdam, Netherlands"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Venue Type
                        </label>
                        <select
                          value={formData.venueType}
                          onChange={(e) => setFormData({ ...formData, venueType: e.target.value })}
                          className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                          <option value="">Select venue type</option>
                          {venueTypes.map((type) => (
                            <option key={type} value={type}>{type}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Requested Installations */}
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-4">
                      Requested Installations *
                    </h3>
                    {requestedInstallations.length === 0 ? (
                      <div className="p-6 border-2 border-dashed border-white/10 rounded-lg text-center">
                        <p className="text-sm text-muted-foreground">
                          No installations selected. Please select installations from the catalog.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {requestedInstallations.map((inst, index) => (
                          <div
                            key={index}
                            className="p-4 bg-white/5 border border-white/10 rounded-lg"
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1">
                                <p className="font-medium text-foreground">{inst.installationName}</p>
                                <div className="grid grid-cols-2 gap-3 mt-3">
                                  <div>
                                    <label className="block text-sm font-medium text-foreground mb-2">
                                      Quantity
                                    </label>
                                    <Input
                                      type="number"
                                      value={inst.quantity.toString()}
                                      onChange={(e) => updateInstallation(index, "quantity", parseInt(e.target.value) || 1)}
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-sm font-medium text-foreground mb-2">
                                      Duration (days)
                                    </label>
                                    <Input
                                      type="number"
                                      value={inst.durationDays.toString()}
                                      onChange={(e) => updateInstallation(index, "durationDays", parseInt(e.target.value) || 1)}
                                    />
                                  </div>
                                </div>
                              </div>
                              <button
                                onClick={() => removeInstallation(index)}
                                className="p-2 hover:bg-red-500/10 rounded-lg transition-colors text-red-400"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Additional Information */}
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-4">Additional Information</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Message
                        </label>
                        <Textarea
                          value={formData.message}
                          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                          placeholder="Tell us more about your event..."
                          rows={3}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Special Requirements
                        </label>
                        <Textarea
                          value={formData.specialRequirements}
                          onChange={(e) => setFormData({ ...formData, specialRequirements: e.target.value })}
                          placeholder="Any special setup requirements, accessibility needs, etc."
                          rows={3}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Estimated Budget (€)
                        </label>
                        <Input
                          type="number"
                          value={formData.estimatedBudget}
                          onChange={(e) => setFormData({ ...formData, estimatedBudget: e.target.value })}
                          placeholder="5000"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between p-6 border-t border-white/10">
                  <p className="text-xs text-muted-foreground">
                    * Required fields
                  </p>
                  <div className="flex gap-3">
                    <Button
                      variant="ghost"
                      onClick={onClose}
                      disabled={isSubmitting}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSubmit}
                      disabled={isSubmitting || submitSuccess}
                      className="bg-gradient-to-r from-primary to-purple-600"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4 mr-2" />
                          Submit Request
                        </>
                      )}
                    </Button>
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
