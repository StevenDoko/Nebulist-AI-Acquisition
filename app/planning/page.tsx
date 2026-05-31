"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, Badge, Button, Input, Select } from "@/components/ui";
import { 
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Filter,
  Clock,
  MapPin,
  Users,
  Package,
  AlertCircle,
  CheckCircle2,
  Circle,
  Eye,
  Trash2,
  Download
} from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, startOfWeek, endOfWeek } from "date-fns";
import { getAllBranches } from "@/data/branches";
import { getEvents } from "@/lib/api/events";
import { getLeads } from "@/lib/api/leads";
import type { Event, Lead } from "@/types";

type ViewMode = "month" | "week" | "timeline";

export default function PlanningPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>("month");
  const [selectedBranch, setSelectedBranch] = useState<string>("all");
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [showAddEventModal, setShowAddEventModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Data from Supabase
  const [events, setEvents] = useState<Event[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  // Form state for new event
  const [newEvent, setNewEvent] = useState({
    name: "",
    description: "",
    eventDate: "",
    eventEndDate: "",
    location: "",
    branchId: "festivals" as string,
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    customerCompany: "",
    expectedAttendees: 0,
    venueType: "",
    status: "inquiry" as Event["status"],
    estimatedBudget: 0,
    notes: "",
  });

  const branches = getAllBranches();

  // Load data from Supabase
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      console.log('Loading events and leads...');
      const [eventsData, leadsData] = await Promise.all([
        getEvents(),
        getLeads()
      ]);
      console.log('Events loaded:', eventsData?.length, eventsData);
      console.log('Leads loaded:', leadsData?.length, leadsData);
      setEvents(eventsData);
      // Filter only leads with event dates
      const scheduledLeads = leadsData.filter(
        lead => lead.eventDate !== null && lead.eventDate !== undefined
      );
      console.log('Scheduled leads:', scheduledLeads?.length);
      setLeads(scheduledLeads);
    } catch (error) {
      console.error('Failed to load data:', error);
      console.error('Error type:', typeof error);
      console.error('Error constructor:', error?.constructor?.name);
      console.error('Error message:', error instanceof Error ? error.message : 'Not an Error object');
      console.error('Error stack:', error instanceof Error ? error.stack : 'No stack');
      if (error && typeof error === 'object') {
        console.error('Error keys:', Object.keys(error));
        console.error('Error values:', Object.values(error));
      }
    } finally {
      setLoading(false);
    }
  };

  // Filter events and leads by branch
  const filteredEvents = selectedBranch === "all"
    ? events
    : events.filter(e => e.branchId === selectedBranch);

  const filteredLeads = selectedBranch === "all"
    ? leads
    : leads.filter(l => l.branch === selectedBranch);

  // Get calendar days
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  // Get events for a specific day
  const getEventsForDay = (day: Date) => {
    return filteredEvents.filter(event => {
      const eventDate = event.eventDate;
      return eventDate && isSameDay(new Date(eventDate), day);
    });
  };

  // Get leads for a specific day (reservation/booking)
  const getLeadsForDay = (day: Date) => {
    return filteredLeads.filter(lead => {
      const leadDate = lead.eventDate; // Event date from CRM
      return leadDate && isSameDay(new Date(leadDate), day);
    });
  };

  // Navigate months
  const previousMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const today = () => setCurrentDate(new Date());

  const handleEventClick = (event: Event) => {
    setSelectedEvent(event);
    setShowEventModal(true);
  };

  const handleExportEvent = (event: Event) => {
    // Get branch name for the export
    const branch = branches.find(b => b.id === event.branchId);
    
    // Create export data with formatted information
    const exportData = {
      eventName: event.name,
      branch: branch?.name || event.branchId,
      status: event.status,
      eventDate: event.eventDate ? format(new Date(event.eventDate), "EEEE, MMMM d, yyyy") : "N/A",
      eventEndDate: event.eventEndDate ? format(new Date(event.eventEndDate), "EEEE, MMMM d, yyyy") : "N/A",
      location: event.location || "N/A",
      description: event.description || "N/A",
      customer: {
        name: event.customerName || "N/A",
        email: event.customerEmail || "N/A",
        phone: event.customerPhone || "N/A",
        company: event.customerCompany || "N/A",
      },
      eventDetails: {
        expectedAttendees: event.expectedAttendees || "TBD",
        venueType: event.venueType || "N/A",
      },
      financial: {
        estimatedBudget: event.estimatedBudget ? `$${event.estimatedBudget.toLocaleString()}` : "N/A",
        finalPrice: event.finalPrice ? `$${event.finalPrice.toLocaleString()}` : "N/A",
        depositPaid: event.depositPaid ? `$${event.depositPaid.toLocaleString()}` : "N/A",
      },
      notes: event.notes || "N/A",
      internalNotes: event.internalNotes || "N/A",
      exportedAt: format(new Date(), "yyyy-MM-dd HH:mm:ss"),
    };

    // Convert to JSON string with pretty formatting
    const jsonString = JSON.stringify(exportData, null, 2);
    
    // Create blob and download
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${event.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${format(new Date(), "yyyyMMdd")}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleAddEvent = async () => {
    if (!newEvent.name) {
      alert("Event name is required");
      return;
    }
    if (!newEvent.eventDate) {
      alert("Event date is required");
      return;
    }

    try {
      setIsSubmitting(true);
      const { eventsApi } = await import("@/lib/api/events");
      
      // Convert date strings to ISO timestamps
      const eventDateISO = new Date(newEvent.eventDate).toISOString();
      const eventEndDateISO = newEvent.eventEndDate 
        ? new Date(newEvent.eventEndDate).toISOString() 
        : undefined;

      console.log("Creating event with data:", {
        name: newEvent.name,
        eventDate: eventDateISO,
        eventEndDate: eventEndDateISO,
        branchId: newEvent.branchId,
      });
      
      await eventsApi.create({
        name: newEvent.name,
        description: newEvent.description || undefined,
        eventDate: eventDateISO,
        eventEndDate: eventEndDateISO,
        location: newEvent.location || undefined,
        branchId: newEvent.branchId,
        customerName: newEvent.customerName || "Unknown Customer",
        customerEmail: newEvent.customerEmail || undefined,
        customerPhone: newEvent.customerPhone || undefined,
        customerCompany: newEvent.customerCompany || undefined,
        expectedAttendees: newEvent.expectedAttendees || undefined,
        venueType: newEvent.venueType || undefined,
        status: newEvent.status,
        estimatedBudget: newEvent.estimatedBudget || undefined,
        finalPrice: undefined,
        depositPaid: undefined,
        notes: newEvent.notes || undefined,
        internalNotes: undefined,
      });

      console.log("Event created successfully");

      // Reload events
      await loadData();

      // Reset form and close modal
      setNewEvent({
        name: "",
        description: "",
        eventDate: "",
        eventEndDate: "",
        location: "",
        branchId: "festivals",
        customerName: "",
        customerEmail: "",
        customerPhone: "",
        customerCompany: "",
        expectedAttendees: 0,
        venueType: "",
        status: "inquiry",
        estimatedBudget: 0,
        notes: "",
      });
      setShowAddEventModal(false);
      alert("Event created successfully!");
    } catch (error) {
      console.error("Failed to create event:", error);
      alert(`Failed to create event: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper functions for lead status colors
  const getLeadStatusColor = (status: Lead["status"]) => {
    switch (status) {
      case "reservation": return "bg-blue-500/80 hover:bg-blue-500";
      case "booked": return "bg-green-500/80 hover:bg-green-500";
      default: return "bg-gray-500/80 hover:bg-gray-500";
    }
  };

  const getLeadStatusBadge = (status: Lead["status"]) => {
    switch (status) {
      case "reservation": return "Reservation";
      case "booked": return "Booked";
      default: return status;
    }
  };

  const getStatusColor = (status: Event["status"]) => {
    switch (status) {
      case "final_booking": return "text-green-400 bg-green-500/20";
      case "reservation": return "text-yellow-400 bg-yellow-500/20";
      case "completed": return "text-blue-400 bg-blue-500/20";
      case "cancelled": return "text-red-400 bg-red-500/20";
      case "warm_lead": return "text-orange-400 bg-orange-500/20";
      case "inquiry": return "text-purple-400 bg-purple-500/20";
      default: return "text-gray-400 bg-gray-500/20";
    }
  };

  const getStatusIcon = (status: Event["status"]) => {
    switch (status) {
      case "final_booking": return <CheckCircle2 className="w-3 h-3" />;
      case "reservation": return <AlertCircle className="w-3 h-3" />;
      case "completed": return <CheckCircle2 className="w-3 h-3" />;
      case "cancelled": return <Circle className="w-3 h-3" />;
      case "warm_lead": return <Clock className="w-3 h-3" />;
      case "inquiry": return <Circle className="w-3 h-3" />;
      default: return <Circle className="w-3 h-3" />;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-gradient mb-2">Event Planning</h1>
          <p className="text-muted-foreground">
            Schedule and manage installations across all events
          </p>
        </div>
      </div>

      {/* Controls */}
      <Card>
        <div className="flex items-center justify-between flex-wrap gap-4">
          {/* Calendar Navigation */}
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={previousMonth}>
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <div className="min-w-[200px] text-center">
              <h2 className="text-xl font-bold text-foreground">
                {format(currentDate, "MMMM yyyy")}
              </h2>
            </div>
            <Button variant="ghost" size="sm" onClick={nextMonth}>
              <ChevronRight className="w-5 h-5" />
            </Button>
            <Button variant="secondary" size="sm" onClick={today}>
              Today
            </Button>
          </div>

          {/* View Mode & Filters */}
          <div className="flex items-center gap-2">
            <Select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              options={[
                { value: "all", label: "All Branches" },
                ...branches.map(branch => ({
                  value: branch.id,
                  label: `${branch.icon} ${branch.name}`,
                })),
              ]}
            />
            <div className="flex items-center gap-1 p-1 rounded-lg glass-dark">
              <button
                onClick={() => setViewMode("month")}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                  viewMode === "month"
                    ? "bg-purple-600 text-white"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Month
              </button>
              <button
                onClick={() => setViewMode("timeline")}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                  viewMode === "timeline"
                    ? "bg-purple-600 text-white"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Timeline
              </button>
            </div>
          </div>
        </div>
      </Card>

      {/* Loading State */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading events...</p>
          </div>
        </div>
      ) : (
        <>
          {/* Calendar View */}
          {viewMode === "month" && (
        <Card className="overflow-hidden">
          {/* Weekday Headers */}
          <div className="grid grid-cols-7 gap-px bg-white/5">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
              <div
                key={day}
                className="bg-background p-3 text-center text-sm font-semibold text-muted-foreground"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-px bg-white/5">
            {calendarDays.map((day, index) => {
              const dayEvents = getEventsForDay(day);
              const dayLeads = getLeadsForDay(day);
              const totalItems = dayEvents.length + dayLeads.length;
              const isCurrentMonth = isSameMonth(day, currentDate);
              const isToday = isSameDay(day, new Date());

              return (
                <motion.div
                  key={day.toISOString()}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.01 }}
                  className={`bg-background min-h-[120px] p-2 ${
                    !isCurrentMonth ? "opacity-40" : ""
                  }`}
                >
                  {/* Day Number */}
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`text-sm font-medium ${
                        isToday
                          ? "w-7 h-7 rounded-full bg-purple-600 text-white flex items-center justify-center"
                          : "text-foreground"
                      }`}
                    >
                      {format(day, "d")}
                    </span>
                    {totalItems > 0 && (
                      <span className="text-xs text-muted-foreground">
                        {totalItems}
                      </span>
                    )}
                  </div>

                  {/* Events and Leads */}
                  <div className="space-y-1">
                    {/* Display Events */}
                    {dayEvents.slice(0, 2).map(event => {
                      const branch = branches.find(b => b.id === event.branchId);
                      return (
                        <motion.button
                          key={event.id}
                          whileHover={{ scale: 1.02 }}
                          onClick={() => handleEventClick(event)}
                          className={`w-full text-left p-1.5 rounded text-xs font-medium truncate gradient-${event.branchId} hover:opacity-80 transition-opacity`}
                        >
                          {event.name}
                        </motion.button>
                      );
                    })}
                    
                    {/* Display Leads (Reservations/Bookings) */}
                    {dayLeads.slice(0, 2 - dayEvents.slice(0, 2).length).map(lead => {
                      const leadBranch = branches.find(b => b.id === lead.branch);
                      return (
                        <motion.div
                          key={lead.id}
                          whileHover={{ scale: 1.02 }}
                          className={`w-full text-left p-2 rounded text-xs ${getLeadStatusColor(lead.status)} text-white transition-colors cursor-pointer`}
                          title={`${lead.companyName} - ${getLeadStatusBadge(lead.status)} - ${leadBranch?.name || lead.branch}`}
                        >
                          <div className="flex items-start gap-1.5">
                            <CalendarIcon className="w-3 h-3 flex-shrink-0 mt-0.5" />
                            <div className="flex-1 min-w-0">
                              <div className="font-semibold truncate">{lead.companyName}</div>
                              <div className="text-[10px] opacity-90 flex items-center gap-1 mt-0.5">
                                <span>{getLeadStatusBadge(lead.status)}</span>
                                <span>•</span>
                                <span className="truncate">{leadBranch?.name || lead.branch}</span>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                    
                    {totalItems > 2 && (
                      <button className="w-full text-left text-xs text-muted-foreground hover:text-foreground transition-colors">
                        +{totalItems - 2} more
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Timeline View */}
      {viewMode === "timeline" && (
        <div className="space-y-4">
          {filteredEvents
            .sort((a, b) => {
              const dateA = a.eventDate;
              const dateB = b.eventDate;
              return new Date(dateA).getTime() - new Date(dateB).getTime();
            })
            .map((event, index) => {
              const branch = branches.find(b => b.id === event.branchId);
              return (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card hover className="relative overflow-hidden">
                    {/* Branch Accent */}
                    <div className={`absolute left-0 top-0 bottom-0 w-1 gradient-${event.branchId}`} />

                    <div className="flex items-start gap-4 pl-4">
                      {/* Date Badge */}
                      <div className="flex-shrink-0 text-center">
                        <div className={`w-16 h-16 rounded-xl gradient-${event.branchId} flex flex-col items-center justify-center`}>
                          <span className="text-xs font-medium text-white/80">
                            {format(new Date(event.eventDate), "MMM")}
                          </span>
                          <span className="text-2xl font-bold text-white">
                            {format(new Date(event.eventDate), "d")}
                          </span>
                        </div>
                      </div>

                      {/* Event Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="text-lg font-bold text-foreground mb-1">
                              {event.name}
                            </h3>
                            <div className="flex items-center gap-3 text-sm text-muted-foreground">
                              {event.location && (
                                <div className="flex items-center gap-1">
                                  <MapPin className="w-4 h-4" />
                                  {event.location}
                                </div>
                              )}
                              <div className="flex items-center gap-1">
                                <Users className="w-4 h-4" />
                                {event.expectedAttendees?.toLocaleString() || 'TBD'} attendees
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="default">{branch?.name}</Badge>
                            <div className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium ${getStatusColor(event.status)}`}>
                              {getStatusIcon(event.status)}
                              {event.status}
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 pt-3 border-t border-white/10">
                          <Button 
                            variant="secondary" 
                            size="sm" 
                            className="flex items-center gap-2"
                            onClick={() => handleEventClick(event)}
                          >
                            <Eye className="w-4 h-4" />
                            View Details
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="flex items-center gap-2"
                            onClick={() => handleExportEvent(event)}
                          >
                            <Download className="w-4 h-4" />
                            Export
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
        </div>
      )}

      {/* Event Detail Modal */}
      <AnimatePresence>
        {showEventModal && selectedEvent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowEventModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-2xl"
            >
              <Card className="relative">
                {/* Close Button */}
                <button
                  onClick={() => setShowEventModal(false)}
                  className="absolute top-4 right-4 w-8 h-8 rounded-lg glass-dark hover:glass-strong flex items-center justify-center transition-all"
                >
                  ×
                </button>

                {/* Header */}
                <div className="mb-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-12 h-12 rounded-xl gradient-${selectedEvent.branchId} flex items-center justify-center text-xl`}>
                      {branches.find(b => b.id === selectedEvent.branchId)?.icon}
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-foreground">
                        {selectedEvent.name}
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(selectedEvent.eventDate), "EEEE, MMMM d, yyyy")}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="default">
                      {branches.find(b => b.id === selectedEvent.branchId)?.name}
                    </Badge>
                    <div className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium ${getStatusColor(selectedEvent.status)}`}>
                      {getStatusIcon(selectedEvent.status)}
                      {selectedEvent.status}
                    </div>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  {selectedEvent.location && (
                    <div className="p-4 rounded-lg glass-dark">
                      <div className="flex items-center gap-2 mb-2">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm font-medium text-foreground">Location</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {selectedEvent.location}
                      </p>
                    </div>
                  )}
                  <div className="p-4 rounded-lg glass-dark">
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm font-medium text-foreground">Attendees</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {selectedEvent.expectedAttendees?.toLocaleString() || 'TBD'} expected
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-4 border-t border-white/10">
                  <Button 
                    variant="secondary" 
                    className="flex-1"
                    onClick={() => handleExportEvent(selectedEvent)}
                  >
                    Export Details
                  </Button>
                </div>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Event Modal */}
      <AnimatePresence>
        {showAddEventModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => !isSubmitting && setShowAddEventModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-3xl max-h-[90vh] overflow-y-auto"
            >
              <Card className="relative">
                {/* Close Button */}
                <button
                  onClick={() => !isSubmitting && setShowAddEventModal(false)}
                  disabled={isSubmitting}
                  className="absolute top-4 right-4 w-8 h-8 rounded-lg glass-dark hover:glass-strong flex items-center justify-center transition-all disabled:opacity-50"
                >
                  ×
                </button>

                {/* Header */}
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-foreground mb-2">Add New Event</h2>
                  <p className="text-sm text-muted-foreground">
                    Create a new event for planning and scheduling
                  </p>
                </div>

                {/* Form */}
                <div className="space-y-4">
                  {/* Event Name */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Event Name *
                    </label>
                    <Input
                      value={newEvent.name}
                      onChange={(e) => setNewEvent({ ...newEvent, name: e.target.value })}
                      placeholder="e.g., Summer Music Festival 2026"
                      disabled={isSubmitting}
                    />
                  </div>

                  {/* Branch */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Branch *
                    </label>
                    <Select
                      value={newEvent.branchId}
                      onChange={(e) => setNewEvent({ ...newEvent, branchId: e.target.value })}
                      disabled={isSubmitting}
                      options={branches.map(branch => ({
                        value: branch.id,
                        label: `${branch.icon} ${branch.name}`,
                      }))}
                    />
                  </div>

                  {/* Date Range */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Start Date *
                      </label>
                      <Input
                        type="date"
                        value={newEvent.eventDate}
                        onChange={(e) => setNewEvent({ ...newEvent, eventDate: e.target.value })}
                        disabled={isSubmitting}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        End Date
                      </label>
                      <Input
                        type="date"
                        value={newEvent.eventEndDate}
                        onChange={(e) => setNewEvent({ ...newEvent, eventEndDate: e.target.value })}
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>

                  {/* Location */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Location
                    </label>
                    <Input
                      value={newEvent.location}
                      onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                      placeholder="e.g., Amsterdam Arena"
                      disabled={isSubmitting}
                      icon={<MapPin className="w-5 h-5" />}
                    />
                  </div>

                  {/* Customer Info */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Customer Name
                      </label>
                      <Input
                        value={newEvent.customerName}
                        onChange={(e) => setNewEvent({ ...newEvent, customerName: e.target.value })}
                        placeholder="Contact person"
                        disabled={isSubmitting}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Company
                      </label>
                      <Input
                        value={newEvent.customerCompany}
                        onChange={(e) => setNewEvent({ ...newEvent, customerCompany: e.target.value })}
                        placeholder="Company name"
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Email
                      </label>
                      <Input
                        type="email"
                        value={newEvent.customerEmail}
                        onChange={(e) => setNewEvent({ ...newEvent, customerEmail: e.target.value })}
                        placeholder="customer@example.com"
                        disabled={isSubmitting}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Phone
                      </label>
                      <Input
                        type="tel"
                        value={newEvent.customerPhone}
                        onChange={(e) => setNewEvent({ ...newEvent, customerPhone: e.target.value })}
                        placeholder="+31 6 12345678"
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>

                  {/* Event Details */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Expected Attendees
                      </label>
                      <Input
                        type="number"
                        value={newEvent.expectedAttendees?.toString() || ""}
                        onChange={(e) => setNewEvent({ ...newEvent, expectedAttendees: parseInt(e.target.value) || 0 })}
                        placeholder="0"
                        disabled={isSubmitting}
                        icon={<Users className="w-5 h-5" />}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Estimated Budget (€)
                      </label>
                      <Input
                        type="number"
                        value={newEvent.estimatedBudget?.toString() || ""}
                        onChange={(e) => setNewEvent({ ...newEvent, estimatedBudget: parseFloat(e.target.value) || 0 })}
                        placeholder="0"
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>

                  {/* Status */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Status
                    </label>
                    <Select
                      value={newEvent.status}
                      onChange={(e) => setNewEvent({ ...newEvent, status: e.target.value as Event["status"] })}
                      disabled={isSubmitting}
                      options={[
                        { value: "inquiry", label: "Inquiry" },
                        { value: "warm_lead", label: "Warm Lead" },
                        { value: "reservation", label: "Reservation" },
                        { value: "final_booking", label: "Final Booking" },
                        { value: "completed", label: "Completed" },
                        { value: "cancelled", label: "Cancelled" },
                      ]}
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Description
                    </label>
                    <textarea
                      value={newEvent.description}
                      onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                      placeholder="Event description and details..."
                      disabled={isSubmitting}
                      rows={3}
                      className="w-full px-4 py-2 rounded-lg glass border border-white/10 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all disabled:opacity-50"
                    />
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Notes
                    </label>
                    <textarea
                      value={newEvent.notes}
                      onChange={(e) => setNewEvent({ ...newEvent, notes: e.target.value })}
                      placeholder="Additional notes..."
                      disabled={isSubmitting}
                      rows={2}
                      className="w-full px-4 py-2 rounded-lg glass border border-white/10 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all disabled:opacity-50"
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 mt-6 pt-6 border-t border-white/10">
                  <Button
                    variant="secondary"
                    className="flex-1"
                    onClick={() => setShowAddEventModal(false)}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    className="flex-1"
                    onClick={handleAddEvent}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Creating..." : "Create Event"}
                  </Button>
                </div>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
        </>
      )}
    </div>
  );
}
