"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Calendar, User, Mail, Phone, Building, MapPin, FileText } from "lucide-react";
import { Card, Button, Input, Textarea, Select } from "@/components/ui";
import { eventsApi } from "@/lib/api/events";
import { Event, BranchType } from "@/types";

interface CreateEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function CreateEventModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateEventModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    customerCompany: "",
    eventName: "",
    eventType: "festivals" as BranchType,
    eventDate: "",
    location: "",
    status: "inquiry" as Event["status"],
    notes: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.customerName.trim()) {
      alert("Customer name is required");
      return;
    }
    if (!formData.customerEmail.trim()) {
      alert("Customer email is required");
      return;
    }
    if (!formData.eventName.trim()) {
      alert("Event name is required");
      return;
    }
    if (!formData.eventDate) {
      alert("Event date is required");
      return;
    }
    if (!formData.location.trim()) {
      alert("Location is required");
      return;
    }

    try {
      setLoading(true);
      await eventsApi.create({
        name: formData.eventName,
        branchId: formData.eventType,
        customerName: formData.customerName,
        customerEmail: formData.customerEmail,
        customerPhone: formData.customerPhone,
        customerCompany: formData.customerCompany,
        eventDate: formData.eventDate,
        location: formData.location,
        status: formData.status,
        notes: formData.notes,
      });
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error("Failed to create event:", error);
      alert("Failed to create event");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    field: keyof typeof formData,
    value: string
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
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
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-3xl my-8"
            >
              <Card className="relative">
                {/* Header */}
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h2 className="text-3xl font-bold text-gradient mb-2">
                      Create New Event
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      Add a new event to the lead flow
                    </p>
                  </div>
                  <button
                    onClick={onClose}
                    className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Customer Information */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <User className="w-5 h-5" />
                      Customer Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Customer Name *
                        </label>
                        <Input
                          type="text"
                          value={formData.customerName}
                          onChange={(e) =>
                            handleChange("customerName", e.target.value)
                          }
                          placeholder="John Doe"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Email *
                        </label>
                        <Input
                          type="email"
                          value={formData.customerEmail}
                          onChange={(e) =>
                            handleChange("customerEmail", e.target.value)
                          }
                          placeholder="john@example.com"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Phone
                        </label>
                        <Input
                          type="tel"
                          value={formData.customerPhone}
                          onChange={(e) =>
                            handleChange("customerPhone", e.target.value)
                          }
                          placeholder="+62 812 3456 7890"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Company
                        </label>
                        <Input
                          type="text"
                          value={formData.customerCompany}
                          onChange={(e) =>
                            handleChange("customerCompany", e.target.value)
                          }
                          placeholder="Company Name"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Event Details */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <Calendar className="w-5 h-5" />
                      Event Details
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Event Name *
                        </label>
                        <Input
                          type="text"
                          value={formData.eventName}
                          onChange={(e) =>
                            handleChange("eventName", e.target.value)
                          }
                          placeholder="Summer Music Festival"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Event Type *
                        </label>
                        <Select
                          value={formData.eventType}
                          onChange={(e) =>
                            handleChange("eventType", e.target.value)
                          }
                        >
                          <option value="festivals">Festivals</option>
                          <option value="schools">Schools</option>
                          <option value="wedding">Wedding</option>
                          <option value="nightclub">Nightclub</option>
                        </Select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Event Date *
                        </label>
                        <Input
                          type="date"
                          value={formData.eventDate}
                          onChange={(e) =>
                            handleChange("eventDate", e.target.value)
                          }
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Status
                        </label>
                        <Select
                          value={formData.status}
                          onChange={(e) =>
                            handleChange("status", e.target.value as Event["status"])
                          }
                        >
                          <option value="inquiry">Inquiry</option>
                          <option value="warm_lead">Warm Lead</option>
                          <option value="reservation">Reservation</option>
                          <option value="final_booking">Final Booking</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </Select>
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium mb-2">
                          Location *
                        </label>
                        <Input
                          type="text"
                          value={formData.location}
                          onChange={(e) =>
                            handleChange("location", e.target.value)
                          }
                          placeholder="Jakarta Convention Center"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Notes
                    </label>
                    <Textarea
                      value={formData.notes}
                      onChange={(e) => handleChange("notes", e.target.value)}
                      placeholder="Additional notes about the event..."
                      rows={4}
                    />
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 justify-end pt-4 border-t border-white/10">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={onClose}
                      disabled={loading}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={loading}>
                      {loading ? "Creating..." : "Create Event"}
                    </Button>
                  </div>
                </form>
              </Card>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
