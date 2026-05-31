"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Card,
  Badge,
  Button,
  Input,
  Textarea,
  Select,
} from "@/components/ui";
import {
  X,
  Mail,
  Phone,
  Building2,
  Calendar,
  MapPin,
  Users,
  Package,
  MessageSquare,
  Euro,
  FileText,
  Send,
  Save,
  Clock,
  CheckCircle2,
  XCircle,
  Eye,
  AlertCircle,
} from "lucide-react";
import { quoteRequestsApi } from "@/lib/api/quoteRequests";
import { installationsApi } from "@/lib/api/installations";
import type { QuoteRequest, Installation, QuoteRequestStatus } from "@/types";

interface QuoteDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  quote: QuoteRequest;
  onSuccess?: () => void;
}

export default function QuoteDetailModal({
  isOpen,
  onClose,
  quote,
  onSuccess,
}: QuoteDetailModalProps) {
  const [installations, setInstallations] = useState<Installation[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"details" | "respond">("details");

  // Response form state
  const [status, setStatus] = useState(quote.status);
  const [adminNotes, setAdminNotes] = useState(quote.adminNotes || "");
  const [quotedPrice, setQuotedPrice] = useState(
    quote.quotedPrice?.toString() || ""
  );
  const [quotedDetails, setQuotedDetails] = useState(quote.responseNotes || "");

  useEffect(() => {
    loadInstallations();
  }, []);

  const loadInstallations = async () => {
    try {
      const data = await installationsApi.getAll();
      setInstallations(data);
    } catch (error) {
      console.error("Failed to load installations:", error);
    }
  };

  const getInstallationDetails = (installationId: string) => {
    return installations.find((i) => i.id === installationId);
  };

  const calculateEstimatedTotal = () => {
    let total = 0;
    quote.requestedInstallations.forEach((item) => {
      const installation = getInstallationDetails(item.installationId);
      if (installation) {
        // Estimate: base price × quantity × duration
        const basePrice = 500; // Default estimate
        total += basePrice * item.quantity * item.durationDays;
      }
    });
    return total;
  };

  const handleUpdateStatus = async (newStatus: QuoteRequestStatus) => {
    try {
      setLoading(true);
      await quoteRequestsApi.updateStatus(quote.id, newStatus);
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error("Failed to update status:", error);
      alert("Failed to update status");
    } finally {
      setLoading(false);
    }
  };

  const handleSendQuote = async () => {
    if (!quotedPrice || parseFloat(quotedPrice) <= 0) {
      alert("Please enter a valid quoted price");
      return;
    }

    try {
      setLoading(true);
      await quoteRequestsApi.sendQuote(
        quote.id,
        parseFloat(quotedPrice),
        quotedDetails,
        adminNotes
      );
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error("Failed to send quote:", error);
      alert("Failed to send quote");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";
      case "reviewing":
        return "bg-blue-500/10 text-blue-400 border-blue-500/20";
      case "quoted":
        return "bg-purple-500/10 text-purple-400 border-purple-500/20";
      case "accepted":
        return "bg-green-500/10 text-green-400 border-green-500/20";
      case "rejected":
        return "bg-red-500/10 text-red-400 border-red-500/20";
      default:
        return "bg-gray-500/10 text-gray-400 border-gray-500/20";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="w-4 h-4" />;
      case "reviewing":
        return <Eye className="w-4 h-4" />;
      case "quoted":
        return <FileText className="w-4 h-4" />;
      case "accepted":
        return <CheckCircle2 className="w-4 h-4" />;
      case "rejected":
        return <XCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
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
              className="w-full max-w-4xl my-8"
            >
              <Card className="relative">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-3xl font-bold text-gradient">Quote Request</h2>
              <Badge className={getStatusColor(quote.status)}>
                {getStatusIcon(quote.status)}
                <span className="ml-2">{quote.status}</span>
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              Submitted on {new Date(quote.createdAt).toLocaleDateString()} at{" "}
              {new Date(quote.createdAt).toLocaleTimeString()}
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
            onClick={() => setActiveTab("respond")}
            className={`px-4 py-2 font-medium transition-colors relative ${
              activeTab === "respond"
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Respond
            {activeTab === "respond" && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
              />
            )}
          </button>
        </div>

        {/* Content */}
        <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2">
          {activeTab === "details" ? (
            <>
              {/* Customer Information */}
              <Card>
                <h3 className="text-xl font-bold text-foreground mb-4">
                  Customer Information
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Users className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Name</p>
                      <p className="font-medium text-foreground">
                        {quote.customerName}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Mail className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Email</p>
                      <p className="font-medium text-foreground">
                        {quote.customerEmail}
                      </p>
                    </div>
                  </div>
                  {quote.customerPhone && (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Phone className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Phone</p>
                        <p className="font-medium text-foreground">
                          {quote.customerPhone}
                        </p>
                      </div>
                    </div>
                  )}
                  {quote.customerCompany && (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Building2 className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Company</p>
                        <p className="font-medium text-foreground">
                          {quote.customerCompany}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </Card>

              {/* Event Information */}
              {quote.eventName && (
                <Card>
                  <h3 className="text-xl font-bold text-foreground mb-4">
                    Event Information
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-purple-400" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Event Name</p>
                        <p className="font-medium text-foreground">
                          {quote.eventName}
                        </p>
                      </div>
                    </div>
                    {quote.eventDate && (
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                          <Calendar className="w-5 h-5 text-purple-400" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Date</p>
                          <p className="font-medium text-foreground">
                            {new Date(quote.eventDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    )}
                    {quote.eventLocation && (
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                          <MapPin className="w-5 h-5 text-purple-400" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Location</p>
                          <p className="font-medium text-foreground">
                            {quote.eventLocation}
                          </p>
                        </div>
                      </div>
                    )}
                    {quote.expectedAttendees && (
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                          <Users className="w-5 h-5 text-purple-400" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Expected Attendees
                          </p>
                          <p className="font-medium text-foreground">
                            {quote.expectedAttendees}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              )}

              {/* Requested Installations */}
              <Card>
                <h3 className="text-xl font-bold text-foreground mb-4">
                  Requested Installations
                </h3>
                <div className="space-y-3">
                  {quote.requestedInstallations.map((item, index) => {
                    const installation = getInstallationDetails(item.installationId);
                    return (
                      <div
                        key={index}
                        className="p-4 rounded-lg glass-dark flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Package className="w-6 h-6 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium text-foreground">
                              {installation?.name || "Unknown Installation"}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Quantity: {item.quantity} × {item.durationDays} day
                              {item.durationDays > 1 ? "s" : ""}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-4 p-4 rounded-lg bg-primary/5 border border-primary/20">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Estimated Total
                    </span>
                    <span className="text-xl font-bold text-primary">
                      €{calculateEstimatedTotal().toLocaleString()}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    This is a rough estimate. Provide accurate quote in the response tab.
                  </p>
                </div>
              </Card>

              {/* Customer Message */}
              {quote.message && (
                <Card>
                  <h3 className="text-xl font-bold text-foreground mb-4">
                    Customer Message
                  </h3>
                  <div className="p-4 rounded-lg glass-dark">
                    <div className="flex items-start gap-3">
                      <MessageSquare className="w-5 h-5 text-muted-foreground mt-0.5" />
                      <p className="text-foreground whitespace-pre-wrap">
                        {quote.message}
                      </p>
                    </div>
                  </div>
                </Card>
              )}

              {/* Existing Quote (if any) */}
              {quote.quotedPrice && (
                <Card className="border-purple-500/20 bg-purple-500/5">
                  <h3 className="text-xl font-bold text-foreground mb-4">
                    Current Quote
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-4 rounded-lg bg-purple-500/10">
                      <span className="text-muted-foreground">Quoted Price</span>
                      <span className="text-2xl font-bold text-purple-400">
                        €{quote.quotedPrice.toLocaleString()}
                      </span>
                    </div>
                    {quote.responseNotes && (
                      <div className="p-4 rounded-lg glass-dark">
                        <p className="text-sm text-muted-foreground mb-2">
                          Quote Details
                        </p>
                        <p className="text-foreground whitespace-pre-wrap">
                          {quote.responseNotes}
                        </p>
                      </div>
                    )}
                    {quote.respondedAt && (
                      <p className="text-xs text-muted-foreground">
                        Quoted on {new Date(quote.respondedAt).toLocaleDateString()}{" "}
                        by {quote.quotedBy || "Admin"}
                      </p>
                    )}
                  </div>
                </Card>
              )}
            </>
          ) : (
            <>
              {/* Response Form */}
              <Card>
                <h3 className="text-xl font-bold text-foreground mb-4">
                  Update Status
                </h3>
                <Select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as QuoteRequestStatus)}
                  options={[
                    { value: "pending", label: "Pending" },
                    { value: "reviewing", label: "Reviewing" },
                    { value: "quoted", label: "Quoted" },
                    { value: "accepted", label: "Accepted" },
                    { value: "rejected", label: "Rejected" },
                  ]}
                />
                {status !== quote.status && (
                  <Button
                    variant="secondary"
                    className="mt-3 w-full"
                    onClick={() => handleUpdateStatus(status)}
                    disabled={loading}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Update Status to {status}
                  </Button>
                )}
              </Card>

              <Card>
                <h3 className="text-xl font-bold text-foreground mb-4">
                  Send Quote Response
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Quoted Price (€) *
                    </label>
                    <Input
                      type="number"
                      placeholder="Enter quoted price"
                      value={quotedPrice}
                      onChange={(e) => setQuotedPrice(e.target.value)}
                      icon={<Euro className="w-5 h-5" />}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Quote Details / Breakdown
                    </label>
                    <Textarea
                      placeholder="Provide detailed breakdown of the quote, including itemized costs, terms, and conditions..."
                      value={quotedDetails}
                      onChange={(e) => setQuotedDetails(e.target.value)}
                      rows={6}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Admin Notes (Internal)
                    </label>
                    <Textarea
                      placeholder="Internal notes for tracking and reference..."
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      rows={4}
                    />
                  </div>

                  <Button
                    variant="primary"
                    className="w-full"
                    onClick={handleSendQuote}
                    disabled={loading || !quotedPrice}
                  >
                    <Send className="w-4 h-4 mr-2" />
                    {loading ? "Sending..." : "Send Quote"}
                  </Button>
                </div>
              </Card>
            </>
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
