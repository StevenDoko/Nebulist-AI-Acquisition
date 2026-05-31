"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Download, FileText, CheckCircle2 } from "lucide-react";
import { Button, Card } from "@/components/ui";
import type { BranchType } from "@/types";

interface ExportCatalogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (branch: BranchType | "all") => Promise<void>;
}

const BRANCH_OPTIONS = [
  { value: "all" as const, label: "All Branches", description: "Export complete catalog" },
  { value: "festivals" as const, label: "Festivals", description: "Music festivals & outdoor events" },
  { value: "schools" as const, label: "Schools", description: "Educational institutions" },
  { value: "wedding" as const, label: "Wedding", description: "Wedding ceremonies & receptions" },
  { value: "nightclub" as const, label: "Nightclub", description: "Nightlife & club events" },
];

export function ExportCatalogModal({
  isOpen,
  onClose,
  onExport,
}: ExportCatalogModalProps) {
  const [selectedBranch, setSelectedBranch] = useState<BranchType | "all">("all");
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);

  const handleExport = async () => {
    try {
      setIsExporting(true);
      await onExport(selectedBranch);
      setExportSuccess(true);
      
      // Auto close after success
      setTimeout(() => {
        setExportSuccess(false);
        onClose();
      }, 2000);
    } catch (error) {
      console.error("Export failed:", error);
      alert("Failed to export catalog. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  const handleClose = () => {
    if (!isExporting) {
      setExportSuccess(false);
      onClose();
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
            onClick={handleClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-md"
            >
              <Card className="relative">
                {/* Close button */}
                <button
                  onClick={handleClose}
                  disabled={isExporting}
                  className="absolute top-4 right-4 p-2 rounded-lg hover:bg-white/5 transition-colors disabled:opacity-50"
                >
                  <X className="w-5 h-5" />
                </button>

                {/* Header */}
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20">
                    <FileText className="w-6 h-6 text-purple-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-foreground">
                      Export Catalog
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      Select branch to export as PDF
                    </p>
                  </div>
                </div>

                {/* Success State */}
                {exportSuccess && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6 p-4 rounded-lg bg-green-500/10 border border-green-500/20"
                  >
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-green-400" />
                      <div>
                        <p className="font-medium text-green-400">
                          Export Successful!
                        </p>
                        <p className="text-sm text-green-400/70">
                          PDF has been downloaded
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Branch Selection */}
                {!exportSuccess && (
                  <div className="space-y-3 mb-6">
                    <label className="text-sm font-medium text-muted-foreground">
                      Select Branch
                    </label>
                    <div className="space-y-2">
                      {BRANCH_OPTIONS.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => setSelectedBranch(option.value)}
                          disabled={isExporting}
                          className={`
                            w-full p-4 rounded-lg border-2 transition-all text-left
                            ${
                              selectedBranch === option.value
                                ? "border-purple-500 bg-purple-500/10"
                                : "border-white/10 hover:border-white/20 bg-white/5"
                            }
                            disabled:opacity-50 disabled:cursor-not-allowed
                          `}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-foreground">
                                {option.label}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {option.description}
                              </p>
                            </div>
                            {selectedBranch === option.value && (
                              <div className="w-5 h-5 rounded-full bg-purple-500 flex items-center justify-center">
                                <div className="w-2 h-2 rounded-full bg-white" />
                              </div>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                {!exportSuccess && (
                  <div className="flex items-center gap-3">
                    <Button
                      variant="secondary"
                      onClick={handleClose}
                      disabled={isExporting}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="primary"
                      onClick={handleExport}
                      disabled={isExporting}
                      className="flex-1 flex items-center justify-center gap-2"
                    >
                      {isExporting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Exporting...
                        </>
                      ) : (
                        <>
                          <Download className="w-4 h-4" />
                          Export PDF
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </Card>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
