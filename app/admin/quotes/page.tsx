"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, Badge, Button, Input, Select } from "@/components/ui";
import {
  Search,
  Filter,
  Mail,
  Phone,
  Building2,
  Calendar,
  MapPin,
  Users,
  Package,
  Clock,
  Euro,
  MessageSquare,
  CheckCircle2,
  XCircle,
  Eye,
  Send,
  FileText,
  TrendingUp,
  AlertCircle,
} from "lucide-react";
import { quoteRequestsApi } from "@/lib/api/quoteRequests";
import { installationsApi } from "@/lib/api/installations";
import QuoteDetailModal from "@/components/quote/QuoteDetailModal";
import type { QuoteRequest, Installation } from "@/types";

type StatusFilter = "all" | "pending" | "reviewing" | "quoted" | "accepted" | "rejected";

export default function AdminQuotesPage() {
  const [quotes, setQuotes] = useState<QuoteRequest[]>([]);
  const [installations, setInstallations] = useState<Installation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [selectedQuote, setSelectedQuote] = useState<QuoteRequest | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [quotesData, installationsData] = await Promise.all([
        quoteRequestsApi.getAll(),
        installationsApi.getAll(),
      ]);
      setQuotes(quotesData);
      setInstallations(installationsData);
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getInstallationName = (installationId: string) => {
    const installation = installations.find((i) => i.id === installationId);
    return installation?.name || "Unknown Installation";
  };

  const filteredQuotes = quotes.filter((quote) => {
    const matchesStatus = statusFilter === "all" || quote.status === statusFilter;
    const matchesSearch =
      quote.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      quote.customerEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (quote.customerCompany || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (quote.eventName || "").toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

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

  const statusCounts = {
    all: quotes.length,
    pending: quotes.filter((q) => q.status === "pending").length,
    reviewing: quotes.filter((q) => q.status === "reviewing").length,
    quoted: quotes.filter((q) => q.status === "quoted").length,
    accepted: quotes.filter((q) => q.status === "accepted").length,
    rejected: quotes.filter((q) => q.status === "rejected").length,
  };

  const handleViewDetails = (quote: QuoteRequest) => {
    setSelectedQuote(quote);
    setShowDetailModal(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gradient mb-2">Quote Requests</h1>
            <p className="text-muted-foreground">
              Manage and respond to customer quote requests
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="secondary">
              <Filter className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card className="relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-500/10 rounded-full blur-2xl" />
            <div className="relative">
              <div className="flex items-center justify-between mb-2">
                <Clock className="w-8 h-8 text-yellow-400" />
                <TrendingUp className="w-5 h-5 text-yellow-400" />
              </div>
              <p className="text-3xl font-bold text-foreground mb-1">
                {statusCounts.pending}
              </p>
              <p className="text-sm text-muted-foreground">Pending</p>
            </div>
          </Card>

          <Card className="relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl" />
            <div className="relative">
              <div className="flex items-center justify-between mb-2">
                <Eye className="w-8 h-8 text-blue-400" />
              </div>
              <p className="text-3xl font-bold text-foreground mb-1">
                {statusCounts.reviewing}
              </p>
              <p className="text-sm text-muted-foreground">Reviewing</p>
            </div>
          </Card>

          <Card className="relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl" />
            <div className="relative">
              <div className="flex items-center justify-between mb-2">
                <FileText className="w-8 h-8 text-purple-400" />
              </div>
              <p className="text-3xl font-bold text-foreground mb-1">
                {statusCounts.quoted}
              </p>
              <p className="text-sm text-muted-foreground">Quoted</p>
            </div>
          </Card>

          <Card className="relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-green-500/10 rounded-full blur-2xl" />
            <div className="relative">
              <div className="flex items-center justify-between mb-2">
                <CheckCircle2 className="w-8 h-8 text-green-400" />
              </div>
              <p className="text-3xl font-bold text-foreground mb-1">
                {statusCounts.accepted}
              </p>
              <p className="text-sm text-muted-foreground">Accepted</p>
            </div>
          </Card>

          <Card className="relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/10 rounded-full blur-2xl" />
            <div className="relative">
              <div className="flex items-center justify-between mb-2">
                <XCircle className="w-8 h-8 text-red-400" />
              </div>
              <p className="text-3xl font-bold text-foreground mb-1">
                {statusCounts.rejected}
              </p>
              <p className="text-sm text-muted-foreground">Rejected</p>
            </div>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex-1 min-w-[300px]">
              <Input
                placeholder="Search by customer name, email, company, or event..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                icon={<Search className="w-5 h-5" />}
              />
            </div>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
              options={[
                { value: "all", label: `All (${statusCounts.all})` },
                { value: "pending", label: `Pending (${statusCounts.pending})` },
                { value: "reviewing", label: `Reviewing (${statusCounts.reviewing})` },
                { value: "quoted", label: `Quoted (${statusCounts.quoted})` },
                { value: "accepted", label: `Accepted (${statusCounts.accepted})` },
                { value: "rejected", label: `Rejected (${statusCounts.rejected})` },
              ]}
            />
          </div>
        </Card>

        {/* Results Count */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {filteredQuotes.length} of {quotes.length} quote requests
          </p>
        </div>

        {/* Quotes List */}
        <div className="space-y-4">
          {filteredQuotes.length === 0 ? (
            <Card className="p-12 text-center">
              <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">
                No quote requests found
              </h3>
              <p className="text-muted-foreground">
                {searchQuery || statusFilter !== "all"
                  ? "Try adjusting your filters"
                  : "Quote requests will appear here when customers submit them"}
              </p>
            </Card>
          ) : (
            filteredQuotes.map((quote, index) => (
              <motion.div
                key={quote.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card hover className="relative overflow-hidden">
                  <div className="flex items-start gap-4">
                    {/* Status Indicator */}
                    <div className="flex-shrink-0">
                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center ${getStatusColor(
                          quote.status
                        )}`}
                      >
                        {getStatusIcon(quote.status)}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-xl font-bold text-foreground">
                              {quote.customerName}
                            </h3>
                            <Badge className={getStatusColor(quote.status)}>
                              {quote.status}
                            </Badge>
                          </div>
                          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <Mail className="w-4 h-4" />
                              {quote.customerEmail}
                            </div>
                            {quote.customerPhone && (
                              <div className="flex items-center gap-2">
                                <Phone className="w-4 h-4" />
                                {quote.customerPhone}
                              </div>
                            )}
                            {quote.customerCompany && (
                              <div className="flex items-center gap-2">
                                <Building2 className="w-4 h-4" />
                                {quote.customerCompany}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="text-right text-sm text-muted-foreground">
                          <p>{new Date(quote.createdAt).toLocaleDateString()}</p>
                          <p className="text-xs">
                            {new Date(quote.createdAt).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>

                      {/* Event Details */}
                      {quote.eventName && (
                        <div className="mb-3 p-3 rounded-lg glass-dark">
                          <div className="flex flex-wrap gap-4 text-sm">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-muted-foreground" />
                              <span className="font-medium">{quote.eventName}</span>
                            </div>
                            {quote.eventDate && (
                              <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-muted-foreground" />
                                {new Date(quote.eventDate).toLocaleDateString()}
                              </div>
                            )}
                            {quote.eventLocation && (
                              <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-muted-foreground" />
                                {quote.eventLocation}
                              </div>
                            )}
                            {quote.expectedAttendees && (
                              <div className="flex items-center gap-2">
                                <Users className="w-4 h-4 text-muted-foreground" />
                                {quote.expectedAttendees} attendees
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Requested Installations */}
                      <div className="mb-3">
                        <p className="text-xs text-muted-foreground mb-2">
                          Requested Installations:
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {quote.requestedInstallations.map((item, idx) => (
                            <Badge key={idx} variant="default">
                              <Package className="w-3 h-3 mr-1" />
                              {getInstallationName(item.installationId)} × {item.quantity}
                              {item.durationDays > 1 && ` (${item.durationDays}d)`}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {/* Message Preview */}
                      {quote.message && (
                        <div className="mb-3 p-3 rounded-lg glass-dark">
                          <div className="flex items-start gap-2">
                            <MessageSquare className="w-4 h-4 text-muted-foreground mt-0.5" />
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {quote.message}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Quote Details (if quoted) */}
                      {quote.quotedPrice && (
                        <div className="mb-3 p-3 rounded-lg bg-purple-500/10 border border-purple-500/20">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Euro className="w-5 h-5 text-purple-400" />
                              <span className="text-xl font-bold text-purple-400">
                                {quote.quotedPrice.toLocaleString()}
                              </span>
                            </div>
                            {quote.respondedAt && (
                              <p className="text-xs text-muted-foreground">
                                Quoted on {new Date(quote.respondedAt).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex items-center gap-2 pt-3 border-t border-white/10">
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleViewDetails(quote)}
                          className="flex items-center gap-2"
                        >
                          <Eye className="w-4 h-4" />
                          View Details
                        </Button>
                        {quote.status === "pending" && (
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleViewDetails(quote)}
                            className="flex items-center gap-2"
                          >
                            <Send className="w-4 h-4" />
                            Send Quote
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* Quote Detail Modal */}
      {selectedQuote && (
        <QuoteDetailModal
          isOpen={showDetailModal}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedQuote(null);
          }}
          quote={selectedQuote}
          onSuccess={loadData}
        />
      )}
    </div>
  );
}
