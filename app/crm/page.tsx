"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, Badge, Button, Input } from "@/components/ui";
import { 
  Search, 
  Filter, 
  Plus, 
  Mail, 
  Phone, 
  Building2,
  Calendar,
  DollarSign,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  Sparkles,
  TrendingUp,
  Clock,
  CheckCircle2,
  Send,
  FileText,
  Users,
  MailOpen,
  MailX,
  MessageSquare,
  AlertCircle,
  Download
} from "lucide-react";
import { leadsApi } from "@/lib/api/leads";
import { eventsApi } from "@/lib/api/events";
import { getAllBranches, getBranchConfig } from "@/data/branches";
import type { Lead, LeadStatus, BranchType, LeadTemperature, EmailStatus } from "@/types";
import { syncTemperatureWithEmailStatus, getCompatibilityColor } from "@/lib/compatibility";
import { exportLeadsToPDF, exportLeadToPDF } from "@/lib/pdf/exportLeads";

const statusColumns: { status: LeadStatus; label: string; color: string }[] = [
  { status: "cold", label: "Cold Leads", color: "blue" },
  { status: "warm", label: "Warm Acquisition", color: "orange" },
  { status: "reservation", label: "Reservations", color: "yellow" },
  { status: "booked", label: "Final Bookings", color: "green" },
];

export default function CRMPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBranch, setSelectedBranch] = useState<string>("all");
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [viewMode, setViewMode] = useState<"kanban" | "table">("kanban");
  const [showAIScore, setShowAIScore] = useState<string | null>(null);
  const [showAddLeadModal, setShowAddLeadModal] = useState(false);
  const [showFiltersModal, setShowFiltersModal] = useState(false);
  const [allLeads, setAllLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showEditLeadModal, setShowEditLeadModal] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  
  // Response dialog state for email responded workflow
  const [showResponseDialog, setShowResponseDialog] = useState(false);
  const [respondingLead, setRespondingLead] = useState<Lead | null>(null);
  const [visitDate, setVisitDate] = useState("");
  const [responseType, setResponseType] = useState<"positive" | "negative" | null>(null);
  const [bookingType, setBookingType] = useState<"reservation" | "booking" | null>(null);

  // Form state for new lead
  const [newLead, setNewLead] = useState({
    companyName: "",
    contactPerson: "",
    email: "",
    phone: "",
    website: "",
    branch: "festivals" as BranchType,
    status: "cold" as LeadStatus,
    temperature: "cold" as LeadTemperature,
    country: "Netherlands",
    estimatedValue: 0,
  });

  const branches = getAllBranches();

  // Load leads from Supabase on mount
  useEffect(() => {
    async function fetchLeads() {
      try {
        const leads = await leadsApi.getAll();
        setAllLeads(leads);
      } catch (error) {
        console.error("Error loading leads from Supabase:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchLeads();
  }, []);

  // Handle add new lead
  const handleAddLead = async () => {
    // Validation
    if (!newLead.companyName.trim()) {
      alert("Company name is required");
      return;
    }
    if (!newLead.contactPerson.trim()) {
      alert("Contact person is required");
      return;
    }
    if (!newLead.email.trim()) {
      alert("Email is required");
      return;
    }

    setIsSubmitting(true);
    try {
      const leadData = {
        ...newLead,
        notes: [],
        interactions: [],
        socialLinks: {},
      };

      const createdLead = await leadsApi.create(leadData);
      
      // Add to local state
      setAllLeads([...allLeads, createdLead]);
      
      // Reset form
      setNewLead({
        companyName: "",
        contactPerson: "",
        email: "",
        phone: "",
        website: "",
        branch: "festivals",
        status: "cold",
        temperature: "cold",
        country: "Netherlands",
        estimatedValue: 0,
      });
      
      setShowAddLeadModal(false);
      alert("Lead added successfully!");
    } catch (error) {
      console.error("Error adding lead:", error);
      alert("Failed to add lead. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle delete lead
  const handleDeleteLead = async (leadId: string, companyName: string) => {
    if (!confirm(`Are you sure you want to delete ${companyName}?`)) {
      return;
    }

    setIsDeleting(true);
    try {
      await leadsApi.delete(leadId);
      
      // Remove from local state
      setAllLeads(allLeads.filter(lead => lead.id !== leadId));
      
      // Close detail modal if it's open
      if (selectedLead?.id === leadId) {
        setSelectedLead(null);
      }
      
      alert("Lead deleted successfully!");
    } catch (error) {
      console.error("Error deleting lead:", error);
      alert("Failed to delete lead. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle edit lead - open modal with pre-filled data
  const handleOpenEditModal = (lead: Lead) => {
    setEditingLead(lead);
    setShowEditLeadModal(true);
    setSelectedLead(null); // Close detail modal
  };

  // Handle update lead
  const handleUpdateLead = async () => {
    if (!editingLead) return;

    // Validation
    if (!editingLead.companyName.trim()) {
      alert("Company name is required");
      return;
    }
    if (!editingLead.contactPerson.trim()) {
      alert("Contact person is required");
      return;
    }
    if (!editingLead.email.trim()) {
      alert("Email is required");
      return;
    }

    setIsSubmitting(true);
    try {
      const updatedLead = await leadsApi.update(editingLead.id, editingLead);
      
      // Update local state
      setAllLeads(allLeads.map(lead => 
        lead.id === updatedLead.id ? updatedLead : lead
      ));
      
      setShowEditLeadModal(false);
      setEditingLead(null);
      alert("Lead updated successfully!");
    } catch (error) {
      console.error("Error updating lead:", error);
      alert("Failed to update lead. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Mock AI scoring function (0-100)
  const getAIScore = (lead: Lead): number => {
    // Simple mock scoring based on lead properties
    let score = 50;
    if (lead.estimatedValue && lead.estimatedValue > 10000) score += 20;
    if (lead.website) score += 10;
    if (lead.notes && lead.notes.length > 0) score += 10;
    if (lead.status === "warm") score += 10;
    if (lead.status === "reservation") score += 15;
    if (lead.status === "booked") score += 20;
    return Math.min(score, 100);
  };

  // Get email status badge info
  const getEmailStatusBadge = (emailStatus?: EmailStatus) => {
    const statusMap = {
      not_sent: { 
        icon: Mail, 
        label: "Not Sent", 
        color: "text-gray-400", 
        bgColor: "bg-gray-500/10",
        description: "Email belum dikirim"
      },
      email_sent: { 
        icon: Send, 
        label: "Sent", 
        color: "text-blue-400", 
        bgColor: "bg-blue-500/10",
        description: "Email terkirim"
      },
      email_opened: { 
        icon: MailOpen, 
        label: "Opened", 
        color: "text-yellow-400", 
        bgColor: "bg-yellow-500/10",
        description: "Email dibuka"
      },
      responded: { 
        icon: MessageSquare, 
        label: "Responded", 
        color: "text-green-400", 
        bgColor: "bg-green-500/10",
        description: "Lead merespon"
      },
      bounced: { 
        icon: MailX, 
        label: "Bounced", 
        color: "text-red-400", 
        bgColor: "bg-red-500/10",
        description: "Email gagal terkirim"
      },
    };
    return statusMap[emailStatus || "not_sent"];
  };

  // Update email status
  const updateEmailStatus = async (leadId: string, newStatus: EmailStatus) => {
    try {
      const lead = allLeads.find(l => l.id === leadId);
      if (!lead) return;

      // Special handling for "responded" status - show dialog for positive/negative reply
      if (newStatus === "responded") {
        setRespondingLead(lead);
        setShowResponseDialog(true);
        return; // Don't update yet, wait for user to choose positive/negative
      }

      const now = new Date().toISOString();
      
      // Auto-sync temperature based on email status
      const newTemperature = syncTemperatureWithEmailStatus(newStatus, lead.temperature);
      
      const updates: Partial<Lead> = {
        emailStatus: newStatus,
        temperature: newTemperature, // Auto-sync temperature
      };

      // Auto-update lead status based on email engagement
      if (newStatus === "email_opened" && lead.status === "cold") {
        updates.status = "warm"; // Auto-promote to Warm Acquisition when email opened
      }

      // Set timestamp based on status
      if (newStatus === "email_sent") {
        updates.emailSentAt = now;
      } else if (newStatus === "email_opened") {
        updates.emailOpenedAt = now;
      } else if (newStatus === "bounced") {
        updates.emailBouncedAt = now;
        updates.status = "cold"; // Reset to cold when email bounces
      }

      const updatedLead = await leadsApi.update(leadId, updates);
      setAllLeads(allLeads.map(l => l.id === leadId ? updatedLead : l));
      
      if (selectedLead?.id === leadId) {
        setSelectedLead(updatedLead);
      }
    } catch (error) {
      console.error("Error updating email status:", error);
      alert("Failed to update email status");
    }
  };

  // Handle response type selection (positive/negative reply)
  const handleResponseTypeSubmit = async () => {
    if (!respondingLead || !responseType) return;
    
    // For positive reply, require booking type selection
    if (responseType === "positive" && !bookingType) return;

    try {
      const now = new Date().toISOString();
      const updates: Partial<Lead> = {
        emailStatus: "responded",
        emailRespondedAt: now,
      };

      if (responseType === "positive") {
        // Positive reply: change to "reservation" or "booked" based on selection
        if (bookingType === "reservation") {
          updates.status = "reservation";
          updates.temperature = "warm";
        } else if (bookingType === "booking") {
          updates.status = "booked";
          updates.temperature = "hot";
        }
        
        // Store visit/reservation date if provided
        if (visitDate) {
          updates.nextFollowUp = visitDate;
          updates.eventDate = visitDate; // Also set eventDate for event creation
        }
      } else {
        // Negative reply: back to "cold" status
        updates.status = "cold";
        updates.temperature = "cold";
      }

      const updatedLead = await leadsApi.update(respondingLead.id, updates);
      setAllLeads(allLeads.map(l => l.id === respondingLead.id ? updatedLead : l));
      
      if (selectedLead?.id === respondingLead.id) {
        setSelectedLead(updatedLead);
      }

      // If positive reply (booking OR reservation), automatically create event
      if (responseType === "positive" && (bookingType === "booking" || bookingType === "reservation")) {
        try {
          const event = await eventsApi.createFromLead(updatedLead);
          
          // Add note about event creation
          await leadsApi.update(updatedLead.id, {
            notes: [
              ...(updatedLead.notes || []),
              {
                id: `note-${Date.now()}`,
                content: `${bookingType === "booking" ? "Booking" : "Reservation"} confirmed - Event created: ${event.name}`,
                createdAt: new Date().toISOString(),
                author: "System",
                type: "internal" as const
              }
            ]
          });

          // Refresh leads to show the new note
          const refreshedLeads = await leadsApi.getAll();
          setAllLeads(refreshedLeads);
          
          if (selectedLead?.id === updatedLead.id) {
            const refreshedLead = refreshedLeads.find(l => l.id === updatedLead.id);
            if (refreshedLead) setSelectedLead(refreshedLead);
          }
        } catch (eventError) {
          console.error("Error creating event:", eventError);
          alert("Lead updated but failed to create event. You can create it manually from the lead detail.");
        }
      }

      // Reset dialog state
      setShowResponseDialog(false);
      setRespondingLead(null);
      setResponseType(null);
      setBookingType(null);
      setVisitDate("");
    } catch (error) {
      console.error("Error updating response:", error);
      alert("Failed to update response");
    }
  };

  // Handle confirm booking - convert lead to event
  const handleConfirmBooking = async (lead: Lead) => {
    if (!lead.eventDate && !lead.nextFollowUp) {
      alert("Cannot confirm booking: No event date set for this lead");
      return;
    }

    if (!confirm(`Confirm booking for ${lead.companyName}? This will create an event in the planning system.`)) {
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Create event from lead
      const event = await eventsApi.createFromLead(lead);
      
      // Update lead to mark it as converted
      await leadsApi.update(lead.id, {
        notes: [
          ...(lead.notes || []),
          {
            id: `note-${Date.now()}`,
            content: `Booking confirmed - Event created: ${event.name}`,
            createdAt: new Date().toISOString(),
            author: "System",
            type: "internal" as const
          }
        ]
      });

      // Refresh leads
      const updatedLeads = await leadsApi.getAll();
      setAllLeads(updatedLeads);
      
      if (selectedLead?.id === lead.id) {
        const updatedLead = updatedLeads.find(l => l.id === lead.id);
        if (updatedLead) setSelectedLead(updatedLead);
      }

      alert(`Booking confirmed! Event "${event.name}" has been created in the planning system.`);
    } catch (error) {
      console.error("Error confirming booking:", error);
      alert("Failed to confirm booking. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get follow-up suggestions based on lead status
  const getFollowUpSuggestions = (lead: Lead) => {
    const suggestions = {
      cold: [
        { icon: Mail, text: "Send personalized introduction email", priority: "high" },
        { icon: FileText, text: "Research company's recent projects", priority: "medium" },
        { icon: Phone, text: "Schedule discovery call", priority: "medium" },
      ],
      warm: [
        { icon: Send, text: "Share portfolio and case studies", priority: "high" },
        { icon: Calendar, text: "Propose meeting for site visit", priority: "high" },
        { icon: FileText, text: "Prepare custom proposal", priority: "medium" },
      ],
      reservation: [
        { icon: CheckCircle2, text: "Confirm reservation details", priority: "high" },
        { icon: FileText, text: "Send contract and terms", priority: "high" },
        { icon: Calendar, text: "Schedule installation planning", priority: "medium" },
      ],
      booked: [
        { icon: Users, text: "Coordinate with operations team", priority: "high" },
        { icon: Calendar, text: "Finalize installation timeline", priority: "high" },
        { icon: CheckCircle2, text: "Send booking confirmation", priority: "medium" },
      ],
    };
    return suggestions[lead.status] || suggestions.cold;
  };

  const filteredLeads = allLeads.filter((lead) => {
    const matchesSearch = 
      (lead.companyName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (lead.contactPerson || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (lead.email || "").toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesBranch = selectedBranch === "all" || lead.branch === selectedBranch;
    
    return matchesSearch && matchesBranch;
  });

  const getLeadsByStatus = (status: LeadStatus) => {
    return filteredLeads.filter((lead) => lead.status === status);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading CRM data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-gradient mb-2">CRM Pipeline</h1>
          <p className="text-muted-foreground">
            Manage your leads and track acquisition progress
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="secondary" 
            className="flex items-center gap-2"
            onClick={() => exportLeadsToPDF(filteredLeads)}
            disabled={filteredLeads.length === 0}
          >
            <Download className="w-5 h-5" />
            Export All
          </Button>
          <Button 
            variant="primary" 
            className="flex items-center gap-2"
            onClick={() => setShowAddLeadModal(true)}
          >
            <Plus className="w-5 h-5" />
            Add New Lead
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search leads by company, contact, or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              icon={<Search className="w-5 h-5" />}
            />
          </div>
          <div className="flex gap-2">
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="px-4 py-2 rounded-lg glass border border-white/10 text-foreground focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all cursor-pointer [&>option]:bg-gray-900 [&>option]:text-white"
            >
              <option value="all">All Branches</option>
              {branches.map((branch) => (
                <option key={branch.id} value={branch.id}>
                  {branch.icon} {branch.name}
                </option>
              ))}
            </select>
            <Button 
              variant="secondary" 
              className="flex items-center gap-2"
              onClick={() => setShowFiltersModal(true)}
            >
              <Filter className="w-5 h-5" />
              Filters
            </Button>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-4 gap-4 mt-6 pt-6 border-t border-white/10">
          {statusColumns.map((column) => {
            const count = getLeadsByStatus(column.status).length;
            const totalValue = getLeadsByStatus(column.status).reduce(
              (sum, lead) => sum + (lead.estimatedValue || 0),
              0
            );
            return (
              <div key={column.status} className="text-center">
                <p className="text-2xl font-bold text-foreground">{count}</p>
                <p className="text-sm text-muted-foreground mb-1">{column.label}</p>
                <p className="text-xs text-purple-400">€{totalValue.toLocaleString()}</p>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Leads Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <AnimatePresence>
          {filteredLeads.map((lead, index) => {
            const branch = branches.find((b) => b.id === lead.branch);
            const statusColumn = statusColumns.find((col) => col.status === lead.status);
            return (
              <motion.div
                key={lead.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.02, y: -4 }}
                onClick={() => setSelectedLead(lead)}
                onMouseEnter={() => setShowAIScore(lead.id)}
                onMouseLeave={() => setShowAIScore(null)}
                className="p-4 rounded-xl glass-dark hover:glass-strong transition-all cursor-pointer border border-white/10 min-h-[280px] flex flex-col relative overflow-hidden"
              >
                {/* AI Score Badge */}
                <AnimatePresence>
                  {showAIScore === lead.id && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8, y: -10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.8, y: -10 }}
                      className="absolute -top-2 -right-2 z-10"
                    >
                      <div className="relative">
                        <div className="px-3 py-1.5 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center gap-1.5 shadow-lg shadow-purple-500/50">
                          <Sparkles className="w-3 h-3 text-white animate-pulse" />
                          <span className="text-xs font-bold text-white">
                            AI: {getAIScore(lead)}%
                          </span>
                        </div>
                        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 blur-md opacity-50 -z-10" />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Company Info */}
                <div className="flex items-start justify-between mb-3 gap-2">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div
                      className={`w-10 h-10 rounded-lg gradient-${lead.branch} flex items-center justify-center text-white font-semibold text-sm flex-shrink-0`}
                    >
                      {lead.companyName.substring(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-foreground truncate">
                        {lead.companyName}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {lead.contactPerson}
                      </p>
                    </div>
                  </div>
                  <button className="text-muted-foreground hover:text-foreground transition-colors flex-shrink-0">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>

                {/* Status and Branch Badges */}
                <div className="flex items-center gap-2 mb-3 flex-wrap">
                  {statusColumn && (
                    <Badge variant={lead.status as any}>{statusColumn.label}</Badge>
                  )}
                  {branch && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium glass-dark">
                      <span>{branch.icon}</span>
                      <span>{branch.name}</span>
                    </span>
                  )}
                  {/* Email Status Badge */}
                  {(() => {
                    const emailBadge = getEmailStatusBadge(lead.emailStatus);
                    const EmailIcon = emailBadge.icon;
                    return (
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium ${emailBadge.bgColor} ${emailBadge.color}`}>
                        <EmailIcon className="w-3 h-3" />
                        <span>{emailBadge.label}</span>
                      </span>
                    );
                  })()}
                  {/* Compatibility Score Badge */}
                  {lead.compatibilityScore !== undefined && (() => {
                    const colors = getCompatibilityColor(lead.compatibilityScore);
                    return (
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium border ${colors.bg} ${colors.text} ${colors.border}`}>
                        <Sparkles className="w-3 h-3" />
                        <span>{lead.compatibilityScore}% Match</span>
                      </span>
                    );
                  })()}
                </div>

                {/* Lead Details */}
                <div className="space-y-2 text-xs text-muted-foreground flex-1 mb-3">
                  <div className="flex items-center gap-2">
                    <Mail className="w-3 h-3 flex-shrink-0" />
                    <span className="truncate">{lead.email}</span>
                  </div>
                  {lead.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-3 h-3 flex-shrink-0" />
                      <span className="truncate">{lead.phone}</span>
                    </div>
                  )}
                  {lead.estimatedValue && (
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-3 h-3 flex-shrink-0" />
                      <span className="font-semibold text-green-400">
                        €{lead.estimatedValue.toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="mt-auto pt-3 border-t border-white/10 flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    {new Date(lead.updatedAt).toLocaleDateString()}
                  </span>
                  {lead.nextFollowUp && (
                    <div className="flex items-center gap-1 text-xs text-orange-400">
                      <Calendar className="w-3 h-3" />
                      <span>Follow-up</span>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Empty State */}
      {filteredLeads.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 px-4">
          <div className="w-16 h-16 rounded-full glass-dark flex items-center justify-center mb-4">
            <Search className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">No leads found</h3>
          <p className="text-sm text-muted-foreground text-center max-w-md">
            {searchQuery || selectedBranch !== 'all'
              ? 'Try adjusting your filters or search query'
              : 'Get started by adding your first lead'}
          </p>
        </div>
      )}

      {/* Lead Detail Modal */}
      <AnimatePresence>
        {selectedLead && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedLead(null)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl max-h-[90vh] overflow-y-auto z-50"
            >
              <Card className="relative">
                <button
                  onClick={() => setSelectedLead(null)}
                  className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
                >
                  ✕
                </button>

                {/* Lead Header */}
                <div className="flex items-start gap-4 mb-6">
                  <div
                    className={`w-16 h-16 rounded-xl gradient-${selectedLead.branch} flex items-center justify-center text-white font-bold text-xl`}
                  >
                    {selectedLead.companyName.substring(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-foreground mb-1">
                      {selectedLead.companyName}
                    </h2>
                    <p className="text-muted-foreground mb-3">{selectedLead.contactPerson}</p>
                    <div className="flex items-center gap-2">
                      <Badge variant={selectedLead.status as any}>{selectedLead.status}</Badge>
                      {selectedLead.estimatedValue && (
                        <Badge variant="default">€{selectedLead.estimatedValue.toLocaleString()}</Badge>
                      )}
                    </div>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="grid grid-cols-2 gap-4 mb-6 p-4 rounded-lg glass-dark">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Email</p>
                    <p className="text-sm text-foreground">{selectedLead.email}</p>
                  </div>
                  {selectedLead.phone && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Phone</p>
                      <p className="text-sm text-foreground">{selectedLead.phone}</p>
                    </div>
                  )}
                  {selectedLead.website && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Website</p>
                      <a
                        href={selectedLead.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
                      >
                        {selectedLead.website}
                      </a>
                    </div>
                  )}
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Last Updated</p>
                    <p className="text-sm text-foreground">
                      {new Date(selectedLead.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* Branch Details */}
                <div className="mb-6 p-4 rounded-lg glass-dark border border-white/10">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${getBranchConfig(selectedLead.branch).gradient} flex items-center justify-center text-xl`}>
                      {getBranchConfig(selectedLead.branch).icon}
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-muted-foreground mb-1">Branch</p>
                      <p className="text-sm font-medium text-foreground">{getBranchConfig(selectedLead.branch).name}</p>
                    </div>
                    <a
                      href={getBranchConfig(selectedLead.branch).website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-lg glass-strong hover:glass-stronger transition-all text-xs font-medium text-purple-400 hover:text-purple-300 flex items-center gap-1"
                    >
                      Visit Website
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  </div>
                </div>

                {/* Booking/Reservation Details */}
                {(selectedLead.eventDate || selectedLead.reservationType) && (
                  <div className="mb-6 p-4 rounded-xl glass-dark border border-purple-500/20">
                    <div className="flex items-center gap-2 mb-4">
                      <Calendar className="w-5 h-5 text-purple-400" />
                      <h3 className="text-sm font-semibold text-foreground">Booking Details</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      {selectedLead.reservationType && (
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Reservation Type</p>
                          <p className="text-sm font-medium text-foreground">{selectedLead.reservationType}</p>
                        </div>
                      )}
                      {selectedLead.eventDate && (
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Event Date</p>
                          <p className="text-sm font-medium text-foreground">
                            {new Date(selectedLead.eventDate).toLocaleDateString('id-ID', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric'
                            })}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Email Tracking Section */}
                <div className="mb-6 p-4 rounded-xl glass-dark border border-green-500/20">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Mail className="w-5 h-5 text-green-400" />
                      <h3 className="text-sm font-semibold text-foreground">Email Tracking</h3>
                    </div>
                    {(() => {
                      const emailBadge = getEmailStatusBadge(selectedLead.emailStatus);
                      const EmailIcon = emailBadge.icon;
                      return (
                        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${emailBadge.bgColor}`}>
                          <EmailIcon className={`w-4 h-4 ${emailBadge.color}`} />
                          <span className={`text-sm font-medium ${emailBadge.color}`}>
                            {emailBadge.label}
                          </span>
                        </div>
                      );
                    })()}
                  </div>

                  {/* Email Timeline */}
                  <div className="space-y-3 mb-4">
                    {selectedLead.emailSentAt && (
                      <div className="flex items-center gap-3 text-xs">
                        <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                          <Send className="w-4 h-4 text-blue-400" />
                        </div>
                        <div className="flex-1">
                          <p className="text-foreground font-medium">Email Sent</p>
                          <p className="text-muted-foreground">
                            {new Date(selectedLead.emailSentAt).toLocaleString('id-ID', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>
                    )}
                    {selectedLead.emailOpenedAt && (
                      <div className="flex items-center gap-3 text-xs">
                        <div className="w-8 h-8 rounded-lg bg-yellow-500/20 flex items-center justify-center">
                          <MailOpen className="w-4 h-4 text-yellow-400" />
                        </div>
                        <div className="flex-1">
                          <p className="text-foreground font-medium">Email Opened</p>
                          <p className="text-muted-foreground">
                            {new Date(selectedLead.emailOpenedAt).toLocaleString('id-ID', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>
                    )}
                    {selectedLead.emailRespondedAt && (
                      <div className="flex items-center gap-3 text-xs">
                        <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center">
                          <MessageSquare className="w-4 h-4 text-green-400" />
                        </div>
                        <div className="flex-1">
                          <p className="text-foreground font-medium">Lead Responded</p>
                          <p className="text-muted-foreground">
                            {new Date(selectedLead.emailRespondedAt).toLocaleString('id-ID', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>
                    )}
                    {selectedLead.emailBouncedAt && (
                      <div className="flex items-center gap-3 text-xs">
                        <div className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center">
                          <MailX className="w-4 h-4 text-red-400" />
                        </div>
                        <div className="flex-1">
                          <p className="text-foreground font-medium">Email Bounced</p>
                          <p className="text-muted-foreground">
                            {new Date(selectedLead.emailBouncedAt).toLocaleString('id-ID', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>
                    )}
                    {!selectedLead.emailSentAt && !selectedLead.emailBouncedAt && (
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <AlertCircle className="w-4 h-4" />
                        <p>Belum ada aktivitas email</p>
                      </div>
                    )}
                  </div>

                  {/* Email Action Buttons */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        updateEmailStatus(selectedLead.id, "email_sent");
                      }}
                      disabled={selectedLead.emailStatus === "email_sent" || selectedLead.emailStatus === "email_opened" || selectedLead.emailStatus === "responded"}
                      className="px-3 py-2 rounded-lg glass-strong hover:glass-stronger transition-all text-xs font-medium text-blue-400 hover:text-blue-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Send className="w-3 h-3" />
                      Mark as Sent
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        updateEmailStatus(selectedLead.id, "email_opened");
                      }}
                      disabled={selectedLead.emailStatus === "not_sent" || selectedLead.emailStatus === "email_opened" || selectedLead.emailStatus === "responded" || selectedLead.emailStatus === "bounced"}
                      className="px-3 py-2 rounded-lg glass-strong hover:glass-stronger transition-all text-xs font-medium text-yellow-400 hover:text-yellow-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <MailOpen className="w-3 h-3" />
                      Mark as Opened
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        updateEmailStatus(selectedLead.id, "responded");
                      }}
                      disabled={selectedLead.emailStatus === "not_sent" || selectedLead.emailStatus === "responded" || selectedLead.emailStatus === "bounced"}
                      className="px-3 py-2 rounded-lg glass-strong hover:glass-stronger transition-all text-xs font-medium text-green-400 hover:text-green-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <MessageSquare className="w-3 h-3" />
                      Mark as Responded
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        updateEmailStatus(selectedLead.id, "bounced");
                      }}
                      disabled={selectedLead.emailStatus === "bounced" || selectedLead.emailStatus === "responded"}
                      className="px-3 py-2 rounded-lg glass-strong hover:glass-stronger transition-all text-xs font-medium text-red-400 hover:text-red-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <MailX className="w-3 h-3" />
                      Mark as Bounced
                    </button>
                  </div>
                </div>

                {/* AI Score Section */}
                <div className="mb-6 p-4 rounded-xl glass-dark border border-purple-500/20">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-purple-400" />
                      <h3 className="text-sm font-semibold text-foreground">AI Lead Score</h3>
                    </div>
                    <div className="px-3 py-1 rounded-full bg-gradient-to-r from-purple-500 to-pink-500">
                      <span className="text-sm font-bold text-white">
                        {getAIScore(selectedLead)}%
                      </span>
                    </div>
                  </div>
                  <div className="relative h-2 rounded-full bg-white/5 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${getAIScore(selectedLead)}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className="absolute inset-y-0 left-0 bg-gradient-to-r from-purple-500 to-pink-500"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Based on engagement, value, and conversion probability
                  </p>
                </div>

                {/* Compatibility Score Section */}
                {selectedLead.compatibilityScore !== undefined && (() => {
                  const colors = getCompatibilityColor(selectedLead.compatibilityScore);
                  return (
                    <div className={`mb-6 p-4 rounded-xl glass-dark border ${colors.border}`}>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Sparkles className={`w-5 h-5 ${colors.text}`} />
                          <h3 className="text-sm font-semibold text-foreground">Event-Machine Compatibility</h3>
                        </div>
                        <div className={`px-3 py-1 rounded-full ${colors.bg} border ${colors.border}`}>
                          <span className={`text-sm font-bold ${colors.text}`}>
                            {selectedLead.compatibilityScore}%
                          </span>
                        </div>
                      </div>
                      <div className="relative h-2 rounded-full bg-white/5 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${selectedLead.compatibilityScore}%` }}
                          transition={{ duration: 1, ease: "easeOut" }}
                          className={`absolute inset-y-0 left-0 ${colors.bg.replace('/10', '/50')}`}
                        />
                      </div>
                      {selectedLead.compatibilityReason && (
                        <p className="text-xs text-muted-foreground mt-2">
                          {selectedLead.compatibilityReason}
                        </p>
                      )}
                    </div>
                  );
                })()}

                {/* Follow-up Suggestions */}
                <div className="mb-6 p-4 rounded-xl glass-dark border border-blue-500/20">
                  <div className="flex items-center gap-2 mb-3">
                    <TrendingUp className="w-5 h-5 text-blue-400" />
                    <h3 className="text-sm font-semibold text-foreground">Suggested Next Steps</h3>
                  </div>
                  <div className="space-y-2">
                    {getFollowUpSuggestions(selectedLead).map((suggestion, idx) => {
                      const Icon = suggestion.icon;
                      return (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.1 }}
                          className="flex items-center gap-3 p-3 rounded-lg glass-dark hover:glass-strong transition-all cursor-pointer group"
                        >
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                            suggestion.priority === 'high' 
                              ? 'bg-orange-500/20 text-orange-400' 
                              : 'bg-blue-500/20 text-blue-400'
                          }`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm text-foreground group-hover:text-purple-400 transition-colors">
                              {suggestion.text}
                            </p>
                          </div>
                          {suggestion.priority === 'high' && (
                            <span className="px-2 py-0.5 rounded text-xs font-medium bg-orange-500/20 text-orange-400">
                              High Priority
                            </span>
                          )}
                        </motion.div>
                      );
                    })}
                  </div>
                </div>

                {/* Notes */}
                {selectedLead.notes && selectedLead.notes.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-sm font-semibold text-foreground mb-2">Notes</h3>
                    <div className="space-y-2">
                      {selectedLead.notes.map((note) => (
                        <div key={note.id} className="text-sm text-muted-foreground p-4 rounded-lg glass-dark">
                          <p className="mb-2">{note.content}</p>
                          <div className="text-xs opacity-60">
                            {note.author} • {new Date(note.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-3">
                  <Button 
                    variant="secondary" 
                    className="flex-1 flex items-center justify-center gap-2"
                    onClick={() => handleOpenEditModal(selectedLead)}
                    disabled={isSubmitting}
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </Button>
                  <Button 
                    variant="secondary" 
                    className="flex-1 flex items-center justify-center gap-2"
                    onClick={() => exportLeadToPDF(selectedLead)}
                  >
                    <Download className="w-4 h-4" />
                    Export
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="flex items-center justify-center gap-2"
                    onClick={() => handleDeleteLead(selectedLead.id, selectedLead.companyName)}
                    disabled={isDeleting}
                  >
                    <Trash2 className="w-4 h-4" />
                    {isDeleting ? "Deleting..." : "Delete"}
                  </Button>
                </div>
              </Card>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Add New Lead Modal */}
      <AnimatePresence>
        {showAddLeadModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddLeadModal(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[95vw] sm:w-full max-w-lg max-h-[90vh] z-50 flex flex-col"
            >
              <Card className="relative flex flex-col max-h-[90vh]">
                {/* Header - Fixed */}
                <div className="flex-shrink-0 pb-4 border-b border-white/10">
                  <button
                    onClick={() => setShowAddLeadModal(false)}
                    className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors z-10"
                  >
                    ✕
                  </button>
                  <h2 className="text-2xl font-bold text-foreground pr-8">Add New Lead</h2>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto py-6 space-y-4 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Company Name *
                    </label>
                    <Input 
                      placeholder="Enter company name" 
                      value={newLead.companyName}
                      onChange={(e) => setNewLead({ ...newLead, companyName: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Contact Person *
                    </label>
                    <Input 
                      placeholder="Enter contact person name" 
                      value={newLead.contactPerson}
                      onChange={(e) => setNewLead({ ...newLead, contactPerson: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Email *
                    </label>
                    <Input 
                      type="email" 
                      placeholder="Enter email address" 
                      value={newLead.email}
                      onChange={(e) => setNewLead({ ...newLead, email: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Phone
                    </label>
                    <Input 
                      type="tel" 
                      placeholder="Enter phone number" 
                      value={newLead.phone}
                      onChange={(e) => setNewLead({ ...newLead, phone: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Website
                    </label>
                    <Input 
                      type="url" 
                      placeholder="https://example.com" 
                      value={newLead.website}
                      onChange={(e) => setNewLead({ ...newLead, website: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Branch
                    </label>
                    <select 
                      className="w-full px-4 py-2 rounded-lg glass border border-white/10 text-foreground focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all [&>option]:bg-gray-900 [&>option]:text-white"
                      value={newLead.branch}
                      onChange={(e) => setNewLead({ ...newLead, branch: e.target.value as BranchType })}
                    >
                      {branches.map((branch) => (
                        <option key={branch.id} value={branch.id}>
                          {branch.icon} {branch.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Status
                    </label>
                    <select 
                      className="w-full px-4 py-2 rounded-lg glass border border-white/10 text-foreground focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all [&>option]:bg-gray-900 [&>option]:text-white"
                      value={newLead.status}
                      onChange={(e) => setNewLead({ ...newLead, status: e.target.value as LeadStatus })}
                    >
                      <option value="cold">Cold</option>
                      <option value="warm">Warm</option>
                      <option value="reservation">Reservation</option>
                      <option value="booked">Booked</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Estimated Value (€)
                    </label>
                    <Input 
                      type="number" 
                      placeholder="Enter estimated value" 
                      value={String(newLead.estimatedValue)}
                      onChange={(e) => setNewLead({ ...newLead, estimatedValue: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                </div>

                {/* Footer - Fixed */}
                <div className="flex-shrink-0 pt-4 border-t border-white/10">
                  <div className="flex gap-3">
                    <Button
                      variant="secondary"
                      className="flex-1"
                      onClick={() => setShowAddLeadModal(false)}
                      disabled={isSubmitting}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="primary"
                      className="flex-1"
                      onClick={handleAddLead}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Adding..." : "Add Lead"}
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Edit Lead Modal */}
      <AnimatePresence>
        {showEditLeadModal && editingLead && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowEditLeadModal(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[95vw] sm:w-full max-w-lg max-h-[90vh] z-50 flex flex-col"
            >
              <Card className="relative flex flex-col max-h-[90vh]">
                {/* Header - Fixed */}
                <div className="flex-shrink-0 pb-4 border-b border-white/10">
                  <button
                    onClick={() => setShowEditLeadModal(false)}
                    className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors z-10"
                  >
                    ✕
                  </button>
                  <h2 className="text-2xl font-bold text-foreground pr-8">Edit Lead</h2>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto py-6 space-y-4 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Company Name *
                    </label>
                    <Input 
                      placeholder="Enter company name" 
                      value={editingLead.companyName}
                      onChange={(e) => setEditingLead({ ...editingLead, companyName: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Contact Person *
                    </label>
                    <Input 
                      placeholder="Enter contact person name" 
                      value={editingLead.contactPerson}
                      onChange={(e) => setEditingLead({ ...editingLead, contactPerson: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Email *
                    </label>
                    <Input 
                      type="email" 
                      placeholder="Enter email address" 
                      value={editingLead.email}
                      onChange={(e) => setEditingLead({ ...editingLead, email: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Phone
                    </label>
                    <Input 
                      type="tel" 
                      placeholder="Enter phone number" 
                      value={editingLead.phone || ""}
                      onChange={(e) => setEditingLead({ ...editingLead, phone: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Website
                    </label>
                    <Input 
                      type="url" 
                      placeholder="https://example.com" 
                      value={editingLead.website || ""}
                      onChange={(e) => setEditingLead({ ...editingLead, website: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Branch
                    </label>
                    <select 
                      className="w-full px-4 py-2 rounded-lg glass border border-white/10 text-foreground focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all [&>option]:bg-gray-900 [&>option]:text-white"
                      value={editingLead.branch}
                      onChange={(e) => setEditingLead({ ...editingLead, branch: e.target.value as BranchType })}
                    >
                      {branches.map((branch) => (
                        <option key={branch.id} value={branch.id}>
                          {branch.icon} {branch.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Status
                    </label>
                    <select 
                      className="w-full px-4 py-2 rounded-lg glass border border-white/10 text-foreground focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all [&>option]:bg-gray-900 [&>option]:text-white"
                      value={editingLead.status}
                      onChange={(e) => setEditingLead({ ...editingLead, status: e.target.value as LeadStatus })}
                    >
                      <option value="cold">Cold</option>
                      <option value="warm">Warm</option>
                      <option value="reservation">Reservation</option>
                      <option value="booked">Booked</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Estimated Value (€)
                    </label>
                    <Input 
                      type="number" 
                      placeholder="Enter estimated value" 
                      value={String(editingLead.estimatedValue || 0)}
                      onChange={(e) => setEditingLead({ ...editingLead, estimatedValue: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                </div>

                {/* Footer - Fixed */}
                <div className="flex-shrink-0 pt-4 border-t border-white/10">
                  <div className="flex gap-3">
                    <Button
                      variant="secondary"
                      className="flex-1"
                      onClick={() => setShowEditLeadModal(false)}
                      disabled={isSubmitting}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="primary"
                      className="flex-1"
                      onClick={handleUpdateLead}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Updating..." : "Update Lead"}
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Filters Modal */}
      <AnimatePresence>
        {showFiltersModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowFiltersModal(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md z-50"
            >
              <Card className="relative">
                <button
                  onClick={() => setShowFiltersModal(false)}
                  className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
                >
                  ✕
                </button>

                <h2 className="text-2xl font-bold text-foreground mb-6">Advanced Filters</h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Lead Status
                    </label>
                    <div className="space-y-2">
                      {statusColumns.map((column) => (
                        <label key={column.status} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            defaultChecked
                            className="w-4 h-4 rounded border-white/10 bg-white/5 text-purple-500 focus:ring-purple-500/50"
                          />
                          <span className="text-sm text-foreground">{column.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Estimated Value Range
                    </label>
                    <div className="flex gap-2">
                      <Input type="number" placeholder="Min" />
                      <Input type="number" placeholder="Max" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Last Updated
                    </label>
                    <select className="w-full px-4 py-2 rounded-lg glass border border-white/10 text-foreground focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all [&>option]:bg-gray-900 [&>option]:text-white">
                      <option value="all">All Time</option>
                      <option value="today">Today</option>
                      <option value="week">This Week</option>
                      <option value="month">This Month</option>
                      <option value="quarter">This Quarter</option>
                    </select>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button
                      variant="ghost"
                      className="flex-1"
                      onClick={() => {
                        // TODO: Implement reset filters
                        alert('Reset filters functionality will be implemented');
                      }}
                    >
                      Reset
                    </Button>
                    <Button
                      variant="primary"
                      className="flex-1"
                      onClick={() => {
                        // TODO: Implement apply filters
                        alert('Apply filters functionality will be implemented');
                        setShowFiltersModal(false);
                      }}
                    >
                      Apply Filters
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Response Dialog - Positive/Negative Reply */}
      <AnimatePresence>
        {showResponseDialog && respondingLead && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setShowResponseDialog(false);
                setRespondingLead(null);
                setResponseType(null);
                setVisitDate("");
              }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md z-50"
            >
              <Card className="relative">
                <button
                  onClick={() => {
                    setShowResponseDialog(false);
                    setRespondingLead(null);
                    setResponseType(null);
                    setVisitDate("");
                  }}
                  className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
                >
                  ✕
                </button>

                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center">
                    <MessageSquare className="w-6 h-6 text-green-400" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-foreground">Email Response</h2>
                    <p className="text-sm text-muted-foreground">{respondingLead.companyName}</p>
                  </div>
                </div>

                <p className="text-foreground mb-6">
                  Lead telah merespon email. Apakah ini positive reply atau negative reply?
                </p>

                {/* Response Type Selection */}
                {!responseType && (
                  <div className="space-y-3">
                    <button
                      onClick={() => setResponseType("positive")}
                      className="w-full p-4 rounded-lg glass border border-green-500/20 hover:border-green-500/40 hover:bg-green-500/5 transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center group-hover:bg-green-500/20 transition-colors">
                          <CheckCircle2 className="w-5 h-5 text-green-400" />
                        </div>
                        <div className="text-left">
                          <div className="font-semibold text-foreground">Positive Reply</div>
                          <div className="text-sm text-muted-foreground">Lead tertarik, ubah ke Booked</div>
                        </div>
                      </div>
                    </button>

                    <button
                      onClick={() => setResponseType("negative")}
                      className="w-full p-4 rounded-lg glass border border-red-500/20 hover:border-red-500/40 hover:bg-red-500/5 transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center group-hover:bg-red-500/20 transition-colors">
                          <AlertCircle className="w-5 h-5 text-red-400" />
                        </div>
                        <div className="text-left">
                          <div className="font-semibold text-foreground">Negative Reply</div>
                          <div className="text-sm text-muted-foreground">Lead tidak tertarik, kembali ke Cold</div>
                        </div>
                      </div>
                    </button>
                  </div>
                )}

                {/* Positive Reply - Booking Type Selection */}
                {responseType === "positive" && !bookingType && (
                  <div className="space-y-4">
                    <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                      <div className="flex items-center gap-2 text-green-400 mb-2">
                        <CheckCircle2 className="w-5 h-5" />
                        <span className="font-semibold">Positive Reply Selected</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Pilih apakah lead ini untuk Reservation atau Booking.
                      </p>
                    </div>

                    <div className="space-y-3">
                      <button
                        onClick={() => setBookingType("reservation")}
                        className="w-full p-4 rounded-lg glass border border-blue-500/20 hover:border-blue-500/40 hover:bg-blue-500/5 transition-all group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
                            <Calendar className="w-5 h-5 text-blue-400" />
                          </div>
                          <div className="text-left">
                            <div className="font-semibold text-foreground">Reservation</div>
                            <div className="text-sm text-muted-foreground">Lead tertarik, pindah ke Reservation</div>
                          </div>
                        </div>
                      </button>

                      <button
                        onClick={() => setBookingType("booking")}
                        className="w-full p-4 rounded-lg glass border border-green-500/20 hover:border-green-500/40 hover:bg-green-500/5 transition-all group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center group-hover:bg-green-500/20 transition-colors">
                            <CheckCircle2 className="w-5 h-5 text-green-400" />
                          </div>
                          <div className="text-left">
                            <div className="font-semibold text-foreground">Booking</div>
                            <div className="text-sm text-muted-foreground">Lead confirmed, pindah ke Final Bookings</div>
                          </div>
                        </div>
                      </button>
                    </div>

                    <div className="flex gap-3 pt-4">
                      <Button
                        variant="secondary"
                        className="flex-1"
                        onClick={() => setResponseType(null)}
                      >
                        Back
                      </Button>
                    </div>
                  </div>
                )}

                {/* Positive Reply - Date Picker (after booking type selected) */}
                {responseType === "positive" && bookingType && (
                  <div className="space-y-4">
                    <div className={`p-4 rounded-lg border ${
                      bookingType === "reservation" 
                        ? "bg-blue-500/10 border-blue-500/20" 
                        : "bg-green-500/10 border-green-500/20"
                    }`}>
                      <div className={`flex items-center gap-2 mb-2 ${
                        bookingType === "reservation" ? "text-blue-400" : "text-green-400"
                      }`}>
                        {bookingType === "reservation" ? (
                          <Calendar className="w-5 h-5" />
                        ) : (
                          <CheckCircle2 className="w-5 h-5" />
                        )}
                        <span className="font-semibold">
                          {bookingType === "reservation" ? "Reservation Selected" : "Booking Selected"}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {bookingType === "reservation" 
                          ? "Lead akan dipindahkan ke Reservation. Masukkan tanggal reservasi (opsional)."
                          : "Lead akan dipindahkan ke Final Bookings. Masukkan tanggal kunjungan ke event (opsional)."}
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        <Calendar className="w-4 h-4 inline mr-2" />
                        {bookingType === "reservation" ? "Tanggal Reservasi" : "Tanggal Kunjungan Event"}
                      </label>
                      <Input
                        type="date"
                        value={visitDate}
                        onChange={(e) => setVisitDate(e.target.value)}
                        placeholder={bookingType === "reservation" ? "Pilih tanggal reservasi" : "Pilih tanggal kunjungan"}
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        {bookingType === "reservation" 
                          ? "Tanggal reservasi untuk event"
                          : "Tanggal ketika tim akan datang ke tempat event"}
                      </p>
                    </div>

                    <div className="flex gap-3 pt-4">
                      <Button
                        variant="secondary"
                        className="flex-1"
                        onClick={() => {
                          setBookingType(null);
                          setVisitDate("");
                        }}
                      >
                        Back
                      </Button>
                      <Button
                        variant="primary"
                        className={`flex-1 ${
                          bookingType === "reservation" 
                            ? "bg-blue-500 hover:bg-blue-600" 
                            : "bg-green-500 hover:bg-green-600"
                        }`}
                        onClick={handleResponseTypeSubmit}
                      >
                        {bookingType === "reservation" ? "Confirm Reservation" : "Confirm Booking"}
                      </Button>
                    </div>
                  </div>
                )}

                {/* Negative Reply - Confirmation */}
                {responseType === "negative" && (
                  <div className="space-y-4">
                    <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
                      <div className="flex items-center gap-2 text-red-400 mb-2">
                        <AlertCircle className="w-5 h-5" />
                        <span className="font-semibold">Negative Reply Selected</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Lead akan dipindahkan kembali ke Cold Leads. Anda bisa follow-up lagi di kemudian hari.
                      </p>
                    </div>

                    <div className="flex gap-3 pt-4">
                      <Button
                        variant="secondary"
                        className="flex-1"
                        onClick={() => setResponseType(null)}
                      >
                        Back
                      </Button>
                      <Button
                        variant="primary"
                        className="flex-1 bg-red-500 hover:bg-red-600"
                        onClick={handleResponseTypeSubmit}
                      >
                        Move to Cold
                      </Button>
                    </div>
                  </div>
                )}
              </Card>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
