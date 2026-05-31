"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Calendar,
  User,
  Mail,
  Phone,
  Building,
  MapPin,
  FileText,
  Plus,
  Edit2,
  Trash2,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Eye,
  Clock,
  XCircle,
  Package,
  DollarSign,
} from "lucide-react";
import { Card, Badge, Button, Input, Textarea, Select } from "@/components/ui";
import { eventsApi } from "@/lib/api/events";
import { bookingsApi } from "@/lib/api/bookings";
import { installationsApi } from "@/lib/api/installations";
import { Event, Booking, Installation, BookingStatus } from "@/types";

interface EventDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: Event;
  onSuccess?: () => void;
}

export default function EventDetailModal({
  isOpen,
  onClose,
  event,
  onSuccess,
}: EventDetailModalProps) {
  const [activeTab, setActiveTab] = useState<"details" | "bookings">("details");
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [installations, setInstallations] = useState<Installation[]>([]);
  const [showAddBooking, setShowAddBooking] = useState(false);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);

  const [formData, setFormData] = useState({
    customerName: event.customerName,
    customerEmail: event.customerEmail,
    customerPhone: event.customerPhone,
    customerCompany: event.customerCompany || "",
    eventName: event.name,
    eventType: event.venueType || "",
    eventDate: event.eventDate,
    location: event.location,
    status: event.status,
    notes: event.notes || "",
  });

  const [bookingForm, setBookingForm] = useState({
    installationId: "",
    quantity: 1,
    unitPrice: 0,
    durationDays: 1,
    notes: "",
  });

  useEffect(() => {
    if (activeTab === "bookings") {
      loadBookings();
      loadInstallations();
    }
  }, [activeTab]);

  const loadBookings = async () => {
    try {
      const data = await bookingsApi.getByEventId(event.id);
      setBookings(data);
    } catch (error) {
      console.error("Failed to load bookings:", error);
    }
  };

  const loadInstallations = async () => {
    try {
      const data = await installationsApi.getAll();
      setInstallations(data);
    } catch (error) {
      console.error("Failed to load installations:", error);
    }
  };

  const handleUpdateEvent = async () => {
    try {
      setLoading(true);
      await eventsApi.update(event.id, formData);
      setEditMode(false);
      onSuccess?.();
    } catch (error) {
      console.error("Failed to update event:", error);
      alert("Failed to update event");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (newStatus: Event["status"]) => {
    if (!confirm(`Move event to ${newStatus} status?`)) return;

    try {
      setLoading(true);
      await eventsApi.updateStatus(event.id, newStatus);
      onSuccess?.();
    } catch (error) {
      console.error("Failed to update status:", error);
      alert("Failed to update status");
    } finally {
      setLoading(false);
    }
  };

  const handleAddBooking = async () => {
    if (!bookingForm.installationId) {
      alert("Please select an installation");
      return;
    }

    try {
      setLoading(true);
      await bookingsApi.create({
        eventId: event.id,
        installationId: bookingForm.installationId,
        quantity: bookingForm.quantity,
        unitPrice: bookingForm.unitPrice,
        durationDays: bookingForm.durationDays,
        setupNotes: bookingForm.notes,
        totalPrice: bookingForm.quantity * bookingForm.unitPrice,
        discountAmount: 0,
        finalPrice: bookingForm.quantity * bookingForm.unitPrice,
        status: 'pending' as BookingStatus,
      });
      setShowAddBooking(false);
      setBookingForm({
        installationId: "",
        quantity: 1,
        unitPrice: 0,
        durationDays: 1,
        notes: "",
      });
      await loadBookings();
    } catch (error) {
      console.error("Failed to add booking:", error);
      alert("Failed to add booking");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateBooking = async (bookingId: string, updates: Partial<Booking>) => {
    try {
      setLoading(true);
      await bookingsApi.update(bookingId, updates);
      setEditingBooking(null);
      await loadBookings();
    } catch (error) {
      console.error("Failed to update booking:", error);
      alert("Failed to update booking");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBooking = async (bookingId: string) => {
    if (!confirm("Remove this installation from the event?")) return;

    try {
      setLoading(true);
      await bookingsApi.delete(bookingId);
      await loadBookings();
    } catch (error) {
      console.error("Failed to delete booking:", error);
      alert("Failed to delete booking");
    } finally {
      setLoading(false);
    }
  };

  const getInstallationName = (installationId: string) => {
    const installation = installations.find((i) => i.id === installationId);
    return installation?.name || "Unknown Installation";
  };

  const getStatusColor = (status: Event["status"]) => {
    switch (status) {
      case "inquiry":
        return "bg-blue-500/10 text-blue-400 border-blue-500/20";
      case "warm_lead":
        return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";
      case "reservation":
        return "bg-purple-500/10 text-purple-400 border-purple-500/20";
      case "final_booking":
        return "bg-orange-500/10 text-orange-400 border-orange-500/20";
      case "completed":
        return "bg-green-500/10 text-green-400 border-green-500/20";
      case "cancelled":
        return "bg-red-500/10 text-red-400 border-red-500/20";
      default:
        return "bg-gray-500/10 text-gray-400 border-gray-500/20";
    }
  };

  const getStatusIcon = (status: Event["status"]) => {
    switch (status) {
      case "inquiry":
        return <AlertCircle className="w-4 h-4" />;
      case "warm_lead":
        return <Eye className="w-4 h-4" />;
      case "reservation":
        return <FileText className="w-4 h-4" />;
      case "final_booking":
        return <Clock className="w-4 h-4" />;
      case "completed":
        return <CheckCircle2 className="w-4 h-4" />;
      case "cancelled":
        return <XCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getNextStatus = (currentStatus: Event["status"]): Event["status"] | null => {
    const workflow: Event["status"][] = [
      "inquiry",
      "warm_lead",
      "reservation",
      "final_booking",
      "completed",
    ];
    const currentIndex = workflow.indexOf(currentStatus);
    if (currentIndex >= 0 && currentIndex < workflow.length - 1) {
      return workflow[currentIndex + 1];
    }
    return null;
  };

  const totalBookingValue = bookings.reduce(
    (sum, booking) => sum + booking.totalPrice,
    0
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
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
              className="w-full max-w-5xl my-8"
            >
              <Card className="relative">
                {/* Header */}
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h2 className="text-3xl font-bold text-gradient">
                        {event.name}
                      </h2>
                      <Badge className={getStatusColor(event.status)}>
                        {getStatusIcon(event.status)}
                        <span className="ml-2">{event.status}</span>
                      </Badge>
                      <Badge variant="outline">{event.venueType}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {new Date(event.eventDate).toLocaleDateString()} at{" "}
                      {event.location}
                    </p>
                  </div>
                  <button
                    onClick={onClose}
                    className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 mb-6 border-b border-white/10">
                  <button
                    onClick={() => setActiveTab("details")}
                    className={`px-4 py-2 font-medium transition-colors relative ${
                      activeTab === "details"
                        ? "text-primary"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Details
                    {activeTab === "details" && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                      />
                    )}
                  </button>
                  <button
                    onClick={() => setActiveTab("bookings")}
                    className={`px-4 py-2 font-medium transition-colors relative ${
                      activeTab === "bookings"
                        ? "text-primary"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Bookings ({bookings.length})
                    {activeTab === "bookings" && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                      />
                    )}
                  </button>
                </div>

                {/* Content */}
                <div className="min-h-[400px]">
                  {activeTab === "details" && (
                    <div className="space-y-6">
                      {/* Status Workflow */}
                      {event.status !== "completed" &&
                        event.status !== "cancelled" && (
                          <Card className="p-4 bg-primary/5 border-primary/20">
                            <div className="flex items-center justify-between">
                              <div>
                                <h3 className="font-semibold mb-1">
                                  Status Workflow
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                  Move event through the lead flow
                                </p>
                              </div>
                              <div className="flex gap-2">
                                {getNextStatus(event.status) && (
                                  <Button
                                    onClick={() =>
                                      handleUpdateStatus(
                                        getNextStatus(event.status)!
                                      )
                                    }
                                    disabled={loading}
                                  >
                                    Move to {getNextStatus(event.status)}
                                    <ArrowRight className="w-4 h-4 ml-2" />
                                  </Button>
                                )}
                                <Button
                                  variant="outline"
                                  onClick={() =>
                                    handleUpdateStatus("cancelled")
                                  }
                                  disabled={loading}
                                >
                                  Cancel Event
                                </Button>
                              </div>
                            </div>
                          </Card>
                        )}

                      {/* Event Details */}
                      {editMode ? (
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium mb-2">
                                Customer Name
                              </label>
                              <Input
                                value={formData.customerName}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    customerName: e.target.value,
                                  })
                                }
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-2">
                                Email
                              </label>
                              <Input
                                type="email"
                                value={formData.customerEmail}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    customerEmail: e.target.value,
                                  })
                                }
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-2">
                                Phone
                              </label>
                              <Input
                                value={formData.customerPhone}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    customerPhone: e.target.value,
                                  })
                                }
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-2">
                                Company
                              </label>
                              <Input
                                value={formData.customerCompany}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    customerCompany: e.target.value,
                                  })
                                }
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-2">
                                Event Name
                              </label>
                              <Input
                                value={formData.eventName}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    eventName: e.target.value,
                                  })
                                }
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-2">
                                Event Type
                              </label>
                              <Select
                                value={formData.eventType}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    eventType: e.target.value as any,
                                  })
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
                                Event Date
                              </label>
                              <Input
                                type="date"
                                value={formData.eventDate}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    eventDate: e.target.value,
                                  })
                                }
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-2">
                                Location
                              </label>
                              <Input
                                value={formData.location}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    location: e.target.value,
                                  })
                                }
                              />
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">
                              Notes
                            </label>
                            <Textarea
                              value={formData.notes}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  notes: e.target.value,
                                })
                              }
                              rows={4}
                            />
                          </div>
                          <div className="flex gap-2">
                            <Button onClick={handleUpdateEvent} disabled={loading}>
                              Save Changes
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => setEditMode(false)}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Card className="p-4">
                              <h3 className="font-semibold mb-3 flex items-center gap-2">
                                <User className="w-5 h-5" />
                                Customer Information
                              </h3>
                              <div className="space-y-2 text-sm">
                                <div>
                                  <span className="text-muted-foreground">
                                    Name:
                                  </span>{" "}
                                  {event.customerName}
                                </div>
                                <div>
                                  <span className="text-muted-foreground">
                                    Email:
                                  </span>{" "}
                                  {event.customerEmail}
                                </div>
                                <div>
                                  <span className="text-muted-foreground">
                                    Phone:
                                  </span>{" "}
                                  {event.customerPhone}
                                </div>
                                {event.customerCompany && (
                                  <div>
                                    <span className="text-muted-foreground">
                                      Company:
                                    </span>{" "}
                                    {event.customerCompany}
                                  </div>
                                )}
                              </div>
                            </Card>

                            <Card className="p-4">
                              <h3 className="font-semibold mb-3 flex items-center gap-2">
                                <Calendar className="w-5 h-5" />
                                Event Information
                              </h3>
                              <div className="space-y-2 text-sm">
                                <div>
                                  <span className="text-muted-foreground">
                                    Date:
                                  </span>{" "}
                                  {new Date(event.eventDate).toLocaleDateString()}
                                </div>
                                <div>
                                  <span className="text-muted-foreground">
                                    Location:
                                  </span>{" "}
                                  {event.location}
                                </div>
                                <div>
                                  <span className="text-muted-foreground">
                                    Type:
                                  </span>{" "}
                                  {event.venueType}
                                </div>
                              </div>
                            </Card>
                          </div>

                          {event.notes && (
                            <Card className="p-4">
                              <h3 className="font-semibold mb-2">Notes</h3>
                              <p className="text-sm text-muted-foreground">
                                {event.notes}
                              </p>
                            </Card>
                          )}

                          <div className="flex gap-2">
                            <Button onClick={() => setEditMode(true)}>
                              <Edit2 className="w-4 h-4 mr-2" />
                              Edit Details
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === "bookings" && (
                    <div className="space-y-6">
                      {/* Booking Summary */}
                      <Card className="p-4 bg-primary/5 border-primary/20">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold mb-1">
                              Total Booking Value
                            </h3>
                            <p className="text-2xl font-bold text-primary">
                              {formatCurrency(totalBookingValue)}
                            </p>
                          </div>
                          <Button onClick={() => setShowAddBooking(true)}>
                            <Plus className="w-4 h-4 mr-2" />
                            Add Installation
                          </Button>
                        </div>
                      </Card>

                      {/* Add Booking Form */}
                      {showAddBooking && (
                        <Card className="p-4 border-primary/20">
                          <h3 className="font-semibold mb-4">
                            Add Installation to Event
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                              <label className="block text-sm font-medium mb-2">
                                Installation
                              </label>
                              <Select
                                value={bookingForm.installationId}
                                onChange={(e) =>
                                  setBookingForm({
                                    ...bookingForm,
                                    installationId: e.target.value,
                                  })
                                }
                              >
                                <option value="">Select installation...</option>
                                {installations.map((inst) => (
                                  <option key={inst.id} value={inst.id}>
                                    {inst.name}
                                  </option>
                                ))}
                              </Select>
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-2">
                                Quantity
                              </label>
                              <Input
                                type="number"
                                value={bookingForm.quantity.toString()}
                                onChange={(e) =>
                                  setBookingForm({
                                    ...bookingForm,
                                    quantity: parseInt(e.target.value) || 1,
                                  })
                                }
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-2">
                                Price per Unit (IDR)
                              </label>
                              <Input
                                type="number"
                                value={bookingForm.unitPrice.toString()}
                                onChange={(e) =>
                                  setBookingForm({
                                    ...bookingForm,
                                    unitPrice: parseFloat(e.target.value) || 0,
                                  })
                                }
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-2">
                                Duration (days)
                              </label>
                              <Input
                                type="number"
                                value={bookingForm.durationDays.toString()}
                                onChange={(e) =>
                                  setBookingForm({
                                    ...bookingForm,
                                    durationDays: parseInt(e.target.value) || 1,
                                  })
                                }
                              />
                            </div>
                          </div>
                          <div className="mb-4">
                            <label className="block text-sm font-medium mb-2">
                              Notes
                            </label>
                            <Textarea
                              value={bookingForm.notes}
                              onChange={(e) =>
                                setBookingForm({
                                  ...bookingForm,
                                  notes: e.target.value,
                                })
                              }
                              rows={2}
                            />
                          </div>
                          <div className="flex gap-2">
                            <Button onClick={handleAddBooking} disabled={loading}>
                              Add Booking
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => setShowAddBooking(false)}
                            >
                              Cancel
                            </Button>
                          </div>
                        </Card>
                      )}

                      {/* Bookings List */}
                      {bookings.length === 0 ? (
                        <Card className="p-12 text-center">
                          <Package className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                          <h3 className="text-xl font-semibold mb-2">
                            No installations booked
                          </h3>
                          <p className="text-muted-foreground mb-6">
                            Add installations to this event
                          </p>
                          <Button onClick={() => setShowAddBooking(true)}>
                            <Plus className="w-4 h-4 mr-2" />
                            Add Installation
                          </Button>
                        </Card>
                      ) : (
                        <div className="space-y-4">
                          {bookings.map((booking) => (
                            <Card key={booking.id} className="p-4">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <h4 className="font-semibold mb-2">
                                    {getInstallationName(booking.installationId)}
                                  </h4>
                                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                    <div>
                                      <span className="text-muted-foreground">
                                        Quantity:
                                      </span>{" "}
                                      {booking.quantity}
                                    </div>
                                    <div>
                                      <span className="text-muted-foreground">
                                        Price/Unit:
                                      </span>{" "}
                                      {formatCurrency(booking.unitPrice)}
                                    </div>
                                    <div>
                                      <span className="text-muted-foreground">
                                        Duration:
                                      </span>{" "}
                                      {booking.durationDays} days
                                    </div>
                                    <div>
                                      <span className="text-muted-foreground">
                                        Total:
                                      </span>{" "}
                                      <span className="font-semibold text-primary">
                                        {formatCurrency(booking.totalPrice)}
                                      </span>
                                    </div>
                                  </div>
                                  {booking.setupNotes && (
                                    <p className="text-sm text-muted-foreground mt-2">
                                      {booking.setupNotes}
                                    </p>
                                  )}
                                </div>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDeleteBooking(booking.id)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </Card>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </Card>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
