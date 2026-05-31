"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, Badge, Button, Input, Select } from "@/components/ui";
import { UploadInstallationModal } from "@/components/installations/UploadInstallationModal";
import { EditInstallationModal } from "@/components/installations/EditInstallationModal";
import { RequestQuoteModal } from "@/components/installations/RequestQuoteModal";
import { ExportCatalogModal } from "@/components/installations/ExportCatalogModal";
import { 
  Search,
  Filter,
  Grid3x3,
  List,
  Package,
  Ruler,
  Users,
  Clock,
  Zap,
  Euro,
  Star,
  Eye,
  Heart,
  Share2,
  Download,
  Play,
  Image as ImageIcon,
  Settings,
  TrendingUp,
  Award,
  CheckCircle2,
  Edit,
  Trash2
} from "lucide-react";
import { getAllBranches } from "@/data/branches";
import { installationsApi } from "@/lib/api/installations";
import { exportCatalogToPDF, exportSingleInstallationToPDF } from "@/lib/pdf/exportCatalog";
import type { Installation, BranchType } from "@/types";

type ViewMode = "grid" | "list";

export default function InstallationsPage() {
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBranch, setSelectedBranch] = useState<string>("all");
  const [selectedInstallation, setSelectedInstallation] = useState<Installation | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [editingInstallation, setEditingInstallation] = useState<Installation | null>(null);
  const [selectedInstallationsForQuote, setSelectedInstallationsForQuote] = useState<Installation[]>([]);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [installations, setInstallations] = useState<Installation[]>([]);
  const [loading, setLoading] = useState(true);

  const branches = getAllBranches();

  // Load installations from Supabase
  useEffect(() => {
    loadInstallations();
  }, []);

  const loadInstallations = async () => {
    try {
      setLoading(true);
      const data = await installationsApi.getAll();
      setInstallations(data);
    } catch (error) {
      console.error('Failed to load installations:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter installations
  const filteredInstallations = installations.filter(inst => {
    const suitableFor = inst.suitableFor || [];
    const matchesBranch = selectedBranch === "all" || suitableFor.includes(selectedBranch as any);
    const matchesSearch = inst.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (inst.description || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesBranch && matchesSearch;
  });

  const handleUploadInstallation = async (data: any) => {
    try {
      const newInstallation = await installationsApi.create(data);
      setInstallations([newInstallation, ...installations]);
      setShowUploadModal(false);
    } catch (error) {
      console.error('Failed to create installation:', error);
      alert('Failed to create installation. Please try again.');
    }
  };

  const handleEditInstallation = (installation: Installation) => {
    setEditingInstallation(installation);
    setShowEditModal(true);
  };

  const handleUpdateInstallation = async () => {
    await loadInstallations();
    setShowEditModal(false);
    setEditingInstallation(null);
  };

  const handleDeleteInstallation = async (installation: Installation) => {
    if (!confirm(`Are you sure you want to delete "${installation.name}"? This action can be undone by an administrator.`)) {
      return;
    }

    try {
      await installationsApi.softDelete(installation.id);
      await loadInstallations();
    } catch (error) {
      console.error('Failed to delete installation:', error);
      alert('Failed to delete installation. Please try again.');
    }
  };

  const handleRequestQuote = (installation: Installation) => {
    setSelectedInstallationsForQuote([installation]);
    setShowQuoteModal(true);
  };

  const toggleFavorite = (id: string) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(id)) {
      newFavorites.delete(id);
    } else {
      newFavorites.add(id);
    }
    setFavorites(newFavorites);
  };

  const handleViewDetails = (installation: Installation) => {
    setSelectedInstallation(installation);
    setShowDetailModal(true);
  };

  const handleExportCatalog = async (branch: BranchType | "all") => {
    try {
      await exportCatalogToPDF(installations, { branch });
    } catch (error) {
      console.error('Failed to export catalog:', error);
      throw error;
    }
  };

  const handleDownloadSinglePDF = async (installation: Installation) => {
    try {
      await exportSingleInstallationToPDF(installation);
    } catch (error) {
      console.error('Failed to export installation PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-gradient mb-2">Installation Catalog</h1>
          <p className="text-muted-foreground">
            Browse our collection of artistic installations and experiences
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="secondary" 
            className="flex items-center gap-2"
            onClick={() => setShowExportModal(true)}
          >
            <Download className="w-5 h-5" />
            Export Catalog
          </Button>
          <Button 
            variant="primary" 
            className="flex items-center gap-2"
            onClick={() => setShowUploadModal(true)}
          >
            <Package className="w-5 h-5" />
            New Installation
          </Button>
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading installations...</p>
          </div>
        </div>
      ) : (
        <>
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl" />
              <div className="relative">
                <div className="flex items-center justify-between mb-2">
                  <Package className="w-8 h-8 text-purple-400" />
                  <TrendingUp className="w-5 h-5 text-green-400" />
                </div>
                <p className="text-3xl font-bold text-foreground mb-1">
                  {installations.length}
                </p>
                <p className="text-sm text-muted-foreground">Total Installations</p>
          </div>
        </Card>

        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-green-500/10 rounded-full blur-2xl" />
          <div className="relative">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle2 className="w-8 h-8 text-green-400" />
              <Award className="w-5 h-5 text-yellow-400" />
            </div>
            <p className="text-3xl font-bold text-foreground mb-1">
              {installations.filter(i => i.availability).length}
            </p>
            <p className="text-sm text-muted-foreground">Available Now</p>
          </div>
        </Card>

        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl" />
          <div className="relative">
            <div className="flex items-center justify-between mb-2">
              <Star className="w-8 h-8 text-yellow-400" />
              <TrendingUp className="w-5 h-5 text-green-400" />
            </div>
            <p className="text-3xl font-bold text-foreground mb-1">
              {installations.filter(i => {
                const suitableFor = i.suitableFor || [];
                return suitableFor.length > 2;
              }).length}
            </p>
            <p className="text-sm text-muted-foreground">Most Popular</p>
          </div>
        </Card>

        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/10 rounded-full blur-2xl" />
          <div className="relative">
            <div className="flex items-center justify-between mb-2">
              <Heart className="w-8 h-8 text-red-400" />
              <span className="text-xs text-muted-foreground">This Month</span>
            </div>
            <p className="text-3xl font-bold text-foreground mb-1">
              {favorites.size}
            </p>
            <p className="text-sm text-muted-foreground">Favorites</p>
          </div>
        </Card>
      </div>

      {/* Search & Filters */}
      <Card>
        <div className="flex items-center gap-4 flex-wrap">
          {/* Search */}
          <div className="flex-1 min-w-[300px]">
            <Input
              placeholder="Search installations by name, description, or features..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              icon={<Search className="w-5 h-5" />}
            />
          </div>

          {/* Branch Filter */}
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

          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 p-1 rounded-lg glass-dark">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded-md transition-all ${
                viewMode === "grid"
                  ? "bg-purple-600 text-white"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Grid3x3 className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 rounded-md transition-all ${
                viewMode === "list"
                  ? "bg-purple-600 text-white"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <List className="w-5 h-5" />
            </button>
          </div>
        </div>
      </Card>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {filteredInstallations.length} of {installations.length} installations
        </p>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Sort by:</span>
          <Select
            options={[
              { value: "popular", label: "Most Popular" },
              { value: "name", label: "Name (A-Z)" },
              { value: "price-low", label: "Price: Low to High" },
              { value: "price-high", label: "Price: High to Low" },
            ]}
          />
        </div>
      </div>

      {/* Grid View */}
      {viewMode === "grid" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredInstallations.map((installation, index) => {
            const isFavorite = favorites.has(installation.id);
            const primaryBranch = branches.find(b => b.id === installation.suitableFor[0]);

            return (
              <motion.div
                key={installation.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card hover className="group relative overflow-hidden h-full flex flex-col">
                  {/* Image */}
                  <div className={`relative h-48 ${installation.media && installation.media.length > 0 ? 'bg-black' : `gradient-${installation.suitableFor[0]}`} flex items-center justify-center overflow-hidden`}>
                    {installation.media && installation.media.length > 0 ? (
                      <img 
                        src={installation.media[0].url} 
                        alt={installation.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <ImageIcon className="w-16 h-16 text-white/30" />
                    )}
                    
                    {/* Overlay Actions */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleViewDetails(installation)}
                        className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-colors"
                      >
                        <Eye className="w-5 h-5 text-white" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-colors"
                      >
                        <Play className="w-5 h-5 text-white" />
                      </motion.button>
                    </div>

                    {/* Status Badge */}
                    {installation.status && (
                      <div className="absolute top-3 left-3">
                        <Badge variant="default">
                          {installation.status}
                        </Badge>
                      </div>
                    )}

                    {/* Favorite Button */}
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => toggleFavorite(installation.id)}
                      className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center hover:bg-black/60 transition-colors"
                    >
                      <Heart
                        className={`w-4 h-4 ${
                          isFavorite ? "fill-red-500 text-red-500" : "text-white"
                        }`}
                      />
                    </motion.button>
                  </div>

                  {/* Content */}
                  <div className="p-4 flex-1 flex flex-col">
                    {/* Header */}
                    <div className="mb-3">
                      <h3 className="text-lg font-bold text-foreground mb-1 line-clamp-1">
                        {installation.name}
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {installation.description}
                      </p>
                    </div>

                    {/* Branches */}
                    <div className="flex flex-wrap gap-1 mb-3">
                      {installation.suitableFor.map(branchId => {
                        const branch = branches.find(b => b.id === branchId);
                        return (
                          <span
                            key={branchId}
                            className="text-xs px-2 py-1 rounded-md glass-dark"
                          >
                            {branch?.icon} {branch?.name}
                          </span>
                        );
                      })}
                    </div>

                    {/* Specs Grid */}
                    <div className="grid grid-cols-2 gap-2 mb-3 p-3 rounded-lg glass-dark">
                      <div className="flex items-center gap-2">
                        <Ruler className="w-4 h-4 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          {installation.dimensions.width}x{installation.dimensions.height}m
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">{installation.requirements.operators} ops</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">{installation.requirements.setupTime}min</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Zap className="w-4 h-4 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">{installation.requirements.electricity}</span>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="pt-3 border-t border-white/10 mt-auto space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Starting from</p>
                          <p className="text-lg font-bold text-gradient flex items-center gap-1">
                            <Euro className="w-4 h-4" />
                            {installation.pricing.perDay.toLocaleString()}
                          </p>
                        </div>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleViewDetails(installation)}
                          className="flex items-center gap-2"
                        >
                          <Eye className="w-4 h-4" />
                          Details
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

      {/* List View */}
      {viewMode === "list" && (
        <div className="space-y-4">
          {filteredInstallations.map((installation, index) => {
            const isFavorite = favorites.has(installation.id);

            return (
              <motion.div
                key={installation.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.03 }}
              >
                <Card hover className="relative overflow-hidden">
                  <div className="flex items-start gap-4">
                    {/* Thumbnail */}
                    <div className={`w-32 h-32 rounded-xl ${installation.media && installation.media.length > 0 ? 'bg-black' : `gradient-${installation.suitableFor[0]}`} flex items-center justify-center flex-shrink-0 overflow-hidden`}>
                      {installation.media && installation.media.length > 0 ? (
                        <img 
                          src={installation.media[0].url} 
                          alt={installation.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <ImageIcon className="w-12 h-12 text-white/30" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-foreground mb-1">
                            {installation.name}
                          </h3>
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                            {installation.description}
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {installation.suitableFor.map(branchId => {
                              const branch = branches.find(b => b.id === branchId);
                              return (
                                <Badge key={branchId} variant="default">
                                  {branch?.icon} {branch?.name}
                                </Badge>
                              );
                            })}
                            {installation.status && (
                              <Badge variant="default">
                                {installation.status}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => toggleFavorite(installation.id)}
                          className="w-8 h-8 rounded-full glass-dark flex items-center justify-center hover:glass-strong transition-all"
                        >
                          <Heart
                            className={`w-4 h-4 ${
                              isFavorite ? "fill-red-500 text-red-500" : "text-muted-foreground"
                            }`}
                          />
                        </motion.button>
                      </div>

                      {/* Specs */}
                      <div className="grid grid-cols-4 gap-4 mb-3 p-3 rounded-lg glass-dark">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <Ruler className="w-4 h-4 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">Dimensions</span>
                          </div>
                          <p className="text-sm font-medium text-foreground">
                            {installation.dimensions.width}x{installation.dimensions.height}m
                          </p>
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <Users className="w-4 h-4 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">Operators</span>
                          </div>
                          <p className="text-sm font-medium text-foreground">{installation.requirements.operators}</p>
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <Clock className="w-4 h-4 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">Setup Time</span>
                          </div>
                          <p className="text-sm font-medium text-foreground">{installation.requirements.setupTime}min</p>
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <Zap className="w-4 h-4 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">Power</span>
                          </div>
                          <p className="text-sm font-medium text-foreground">{installation.requirements.electricity}</p>
                        </div>
                      </div>

                      {/* Footer */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            <Euro className="w-5 h-5 text-muted-foreground" />
                            <span className="text-xl font-bold text-gradient">
                              {installation.pricing.perDay.toLocaleString()}
                            </span>
                            <span className="text-sm text-muted-foreground">starting from</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm">
                              <Share2 className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => handleViewDetails(installation)}
                              className="flex items-center gap-2"
                            >
                              <Eye className="w-4 h-4" />
                              View Details
                            </Button>
                          </div>
                        </div>
                        
                        {/* Request Quote Button */}

                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Detail Modal */}
      <AnimatePresence>
        {showDetailModal && selectedInstallation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
            onClick={() => setShowDetailModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-4xl my-8"
            >
              <Card className="relative">
                {/* Close Button */}
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="absolute top-4 right-4 w-8 h-8 rounded-lg glass-dark hover:glass-strong flex items-center justify-center transition-all z-10"
                >
                  ×
                </button>

                {/* Hero Image */}
                <div className={`h-64 gradient-${selectedInstallation.suitableFor[0]} flex items-center justify-center relative overflow-hidden`}>
                  <ImageIcon className="w-24 h-24 text-white/30" />
                  <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
                    <div>
                      <h2 className="text-3xl font-bold text-white mb-2">
                        {selectedInstallation.name}
                      </h2>
                      <div className="flex items-center gap-2">
                        {selectedInstallation.suitableFor.map(branchId => {
                          const branch = branches.find(b => b.id === branchId);
                          return (
                            <Badge key={branchId} variant="default">
                              {branch?.icon} {branch?.name}
                            </Badge>
                          );
                        })}
                      </div>
                    </div>
                    <Badge variant="default">
                      {selectedInstallation.status || "Available"}
                    </Badge>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                  {/* Description */}
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">Description</h3>
                    <p className="text-muted-foreground">{selectedInstallation.description}</p>
                  </div>

                  {/* Technical Specifications */}
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-3">Technical Specifications</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="p-4 rounded-lg glass-dark">
                        <Ruler className="w-6 h-6 text-purple-400 mb-2" />
                        <p className="text-xs text-muted-foreground mb-1">Dimensions</p>
                        <p className="text-sm font-medium text-foreground">
                          {selectedInstallation.dimensions.width}x{selectedInstallation.dimensions.height}x{selectedInstallation.dimensions.depth}m
                        </p>
                      </div>
                      <div className="p-4 rounded-lg glass-dark">
                        <Users className="w-6 h-6 text-blue-400 mb-2" />
                        <p className="text-xs text-muted-foreground mb-1">Operators Required</p>
                        <p className="text-sm font-medium text-foreground">{selectedInstallation.requirements.operators}</p>
                      </div>
                      <div className="p-4 rounded-lg glass-dark">
                        <Clock className="w-6 h-6 text-green-400 mb-2" />
                        <p className="text-xs text-muted-foreground mb-1">Setup Time</p>
                        <p className="text-sm font-medium text-foreground">{selectedInstallation.requirements.setupTime} min</p>
                      </div>
                      <div className="p-4 rounded-lg glass-dark">
                        <Zap className="w-6 h-6 text-yellow-400 mb-2" />
                        <p className="text-xs text-muted-foreground mb-1">Power Required</p>
                        <p className="text-sm font-medium text-foreground">{selectedInstallation.requirements.electricity}</p>
                      </div>
                      <div className="p-4 rounded-lg glass-dark">
                        <Users className="w-6 h-6 text-blue-400 mb-2" />
                        <p className="text-xs text-muted-foreground mb-1">Operators Required</p>
                        <p className="text-sm font-medium text-foreground">{selectedInstallation.operators}</p>
                      </div>
                      <div className="p-4 rounded-lg glass-dark">
                        <Clock className="w-6 h-6 text-green-400 mb-2" />
                        <p className="text-xs text-muted-foreground mb-1">Setup Time</p>
                        <p className="text-sm font-medium text-foreground">{selectedInstallation.setupTime}</p>
                      </div>
                      <div className="p-4 rounded-lg glass-dark">
                        <Zap className="w-6 h-6 text-yellow-400 mb-2" />
                        <p className="text-xs text-muted-foreground mb-1">Power Requirement</p>
                        <p className="text-sm font-medium text-foreground">{selectedInstallation.powerRequirement}</p>
                      </div>
                    </div>
                  </div>

                  {/* Pricing */}
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-3">Pricing</h3>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="p-4 rounded-lg glass-dark">
                        <p className="text-xs text-muted-foreground mb-1">Base Price</p>
                        <p className="text-2xl font-bold text-gradient flex items-center gap-1">
                          <Euro className="w-5 h-5" />
                          {(selectedInstallation.pricing.base || selectedInstallation.pricing.perDay).toLocaleString()}
                        </p>
                      </div>
                      <div className="p-4 rounded-lg glass-dark">
                        <p className="text-xs text-muted-foreground mb-1">Per Day</p>
                        <p className="text-2xl font-bold text-gradient flex items-center gap-1">
                          <Euro className="w-5 h-5" />
                          {selectedInstallation.pricing.perDay.toLocaleString()}
                        </p>
                      </div>
                      <div className="p-4 rounded-lg glass-dark">
                        <p className="text-xs text-muted-foreground mb-1">Per Week</p>
                        <p className="text-2xl font-bold text-gradient flex items-center gap-1">
                          <Euro className="w-5 h-5" />
                          {selectedInstallation.pricing.perWeek.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-3 pt-4 border-t border-white/10">
                    <Button 
                      variant="secondary" 
                      className="flex-1"
                      onClick={() => {
                        setShowDetailModal(false);
                        handleEditInstallation(selectedInstallation);
                      }}
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                    <Button 
                      variant="ghost" 
                      className="flex-1 text-red-400 hover:text-red-300"
                      onClick={() => {
                        setShowDetailModal(false);
                        handleDeleteInstallation(selectedInstallation);
                      }}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </Button>
                    <Button 
                      variant="primary"
                      className="flex-1"
                      onClick={() => handleDownloadSinglePDF(selectedInstallation)}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download PDF
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
        </>
      )}

      {/* Upload Installation Modal */}
      <UploadInstallationModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onSubmit={handleUploadInstallation}
      />

      {/* Edit Installation Modal */}
      {editingInstallation && (
        <EditInstallationModal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setEditingInstallation(null);
          }}
          installation={editingInstallation}
          onSuccess={handleUpdateInstallation}
        />
      )}

      {/* Request Quote Modal */}
      <RequestQuoteModal
        isOpen={showQuoteModal}
        onClose={() => {
          setShowQuoteModal(false);
          setSelectedInstallationsForQuote([]);
        }}
        preSelectedInstallations={selectedInstallationsForQuote}
      />

      {/* Export Catalog Modal */}
      <ExportCatalogModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        onExport={handleExportCatalog}
      />
    </div>
  );
}
