"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Calendar,
  Plus,
  Search,
  Filter,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Eye,
  FileText,
  Trash2,
  RotateCcw,
} from "lucide-react";
import { Card, Badge, Button, Input } from "@/components/ui";
import { eventsApi } from "@/lib/api/events";
import { Event } from "@/types";
import CreateEventModal from "@/components/events/CreateEventModal";
import EventDetailModal from "@/components/events/EventDetailModal";

export default function EventsPage() {
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<Event["status"] | "all">("all");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  useEffect(() => {
    loadEvents();
  }, []);

  useEffect(() => {
    filterEvents();
  }, [events, searchQuery, statusFilter]);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const data = await eventsApi.getAll();
      setEvents(data);
    } catch (error) {
      console.error("Failed to load events:", error);
      alert("Failed to load events");
    } finally {
      setLoading(false);
    }
  };

  const filterEvents = () => {
    let filtered = [...events];

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((event) => event.status === statusFilter);
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (event) =>
          event.customerName.toLowerCase().includes(query) ||
          event.name.toLowerCase().includes(query) ||
          event.customerCompany?.toLowerCase().includes(query) ||
          event.location?.toLowerCase().includes(query)
      );
    }

    setFilteredEvents(filtered);
  };

  const handleDeleteEvent = async (id: string) => {
    if (!confirm("Are you sure you want to delete this event?")) return;

    try {
      await eventsApi.softDelete(id);
      await loadEvents();
    } catch (error) {
      console.error("Failed to delete event:", error);
      alert("Failed to delete event");
    }
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

  const statusCounts = {
    all: events.length,
    inquiry: events.filter((e) => e.status === "inquiry").length,
    warm_lead: events.filter((e) => e.status === "warm_lead").length,
    reservation: events.filter((e) => e.status === "reservation").length,
    final_booking: events.filter((e) => e.status === "final_booking").length,
    completed: events.filter((e) => e.status === "completed").length,
    cancelled: events.filter((e) => e.status === "cancelled").length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold text-gradient mb-2">
            Event Management
          </h1>
          <p className="text-muted-foreground">
            Manage events and bookings through the lead flow
          </p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="w-5 h-5 mr-2" />
          Create Event
        </Button>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-8">
        <Card
          className={`p-4 cursor-pointer transition-all ${
            statusFilter === "all" ? "ring-2 ring-primary" : ""
          }`}
          onClick={() => setStatusFilter("all")}
        >
          <div className="text-2xl font-bold mb-1">{statusCounts.all}</div>
          <div className="text-sm text-muted-foreground">All Events</div>
        </Card>

        <Card
          className={`p-4 cursor-pointer transition-all ${
            statusFilter === "inquiry" ? "ring-2 ring-blue-500" : ""
          }`}
          onClick={() => setStatusFilter("inquiry")}
        >
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="w-4 h-4 text-blue-400" />
            <div className="text-2xl font-bold">{statusCounts.inquiry}</div>
          </div>
          <div className="text-sm text-muted-foreground">Inquiry</div>
        </Card>

        <Card
          className={`p-4 cursor-pointer transition-all ${
            statusFilter === "warm_lead" ? "ring-2 ring-yellow-500" : ""
          }`}
          onClick={() => setStatusFilter("warm_lead")}
        >
          <div className="flex items-center gap-2 mb-2">
            <Eye className="w-4 h-4 text-yellow-400" />
            <div className="text-2xl font-bold">{statusCounts.warm_lead}</div>
          </div>
          <div className="text-sm text-muted-foreground">Warm Lead</div>
        </Card>

        <Card
          className={`p-4 cursor-pointer transition-all ${
            statusFilter === "reservation" ? "ring-2 ring-purple-500" : ""
          }`}
          onClick={() => setStatusFilter("reservation")}
        >
          <div className="flex items-center gap-2 mb-2">
            <FileText className="w-4 h-4 text-purple-400" />
            <div className="text-2xl font-bold">{statusCounts.reservation}</div>
          </div>
          <div className="text-sm text-muted-foreground">Reservation</div>
        </Card>

        <Card
          className={`p-4 cursor-pointer transition-all ${
            statusFilter === "final_booking" ? "ring-2 ring-orange-500" : ""
          }`}
          onClick={() => setStatusFilter("final_booking")}
        >
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-orange-400" />
            <div className="text-2xl font-bold">
              {statusCounts.final_booking}
            </div>
          </div>
          <div className="text-sm text-muted-foreground">Final Booking</div>
        </Card>

        <Card
          className={`p-4 cursor-pointer transition-all ${
            statusFilter === "completed" ? "ring-2 ring-green-500" : ""
          }`}
          onClick={() => setStatusFilter("completed")}
        >
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="w-4 h-4 text-green-400" />
            <div className="text-2xl font-bold">{statusCounts.completed}</div>
          </div>
          <div className="text-sm text-muted-foreground">Completed</div>
        </Card>

        <Card
          className={`p-4 cursor-pointer transition-all ${
            statusFilter === "cancelled" ? "ring-2 ring-red-500" : ""
          }`}
          onClick={() => setStatusFilter("cancelled")}
        >
          <div className="flex items-center gap-2 mb-2">
            <XCircle className="w-4 h-4 text-red-400" />
            <div className="text-2xl font-bold">{statusCounts.cancelled}</div>
          </div>
          <div className="text-sm text-muted-foreground">Cancelled</div>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="p-4 mb-6">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <Input
              type="text"
              placeholder="Search by customer, event name, company, or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </Card>

      {/* Events List */}
      {filteredEvents.length === 0 ? (
        <Card className="p-12 text-center">
          <Calendar className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-xl font-semibold mb-2">No events found</h3>
          <p className="text-muted-foreground mb-6">
            {searchQuery || statusFilter !== "all"
              ? "Try adjusting your filters"
              : "Create your first event to get started"}
          </p>
          {!searchQuery && statusFilter === "all" && (
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus className="w-5 h-5 mr-2" />
              Create Event
            </Button>
          )}
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredEvents.map((event, index) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold">
                        {event.name}
                      </h3>
                      <Badge className={getStatusColor(event.status)}>
                        {getStatusIcon(event.status)}
                        <span className="ml-2">{event.status}</span>
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground mb-4">
                      <div>
                        <div className="font-medium text-foreground">
                          Customer
                        </div>
                        <div>{event.customerName}</div>
                        {event.customerCompany && (
                          <div className="text-xs">{event.customerCompany}</div>
                        )}
                      </div>
                      <div>
                        <div className="font-medium text-foreground">
                          Contact
                        </div>
                        <div>{event.customerEmail}</div>
                        <div>{event.customerPhone}</div>
                      </div>
                      <div>
                        <div className="font-medium text-foreground">Date</div>
                        <div>
                          {new Date(event.eventDate).toLocaleDateString()}
                        </div>
                      </div>
                      <div>
                        <div className="font-medium text-foreground">
                          Location
                        </div>
                        <div>{event.location}</div>
                      </div>
                    </div>

                    {event.notes && (
                      <div className="text-sm text-muted-foreground bg-white/5 p-3 rounded-lg">
                        {event.notes}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedEvent(event)}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteEvent(event.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Modals */}
      {showCreateModal && (
        <CreateEventModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSuccess={loadEvents}
        />
      )}

      {selectedEvent && (
        <EventDetailModal
          isOpen={!!selectedEvent}
          onClose={() => setSelectedEvent(null)}
          event={selectedEvent}
          onSuccess={loadEvents}
        />
      )}
    </div>
  );
}
