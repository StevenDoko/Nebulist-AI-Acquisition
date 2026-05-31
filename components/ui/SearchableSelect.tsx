"use client";

import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { ChevronDown, X } from "lucide-react";

interface Option {
  value: string;
  label: string;
}

interface SearchableSelectProps {
  value?: string;
  onChange?: (value: string) => void;
  options: Option[];
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  loading?: boolean;
}

export function SearchableSelect({
  value,
  onChange,
  options,
  placeholder = "Select...",
  className,
  disabled = false,
  loading = false,
}: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Filter options based on search term
  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get selected option label
  const selectedOption = options.find((opt) => opt.value === value);
  const displayValue = selectedOption ? selectedOption.label : "";

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Focus input when dropdown opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSelect = (optionValue: string) => {
    onChange?.(optionValue);
    setIsOpen(false);
    setSearchTerm("");
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange?.("");
    setSearchTerm("");
  };

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      {/* Trigger Button */}
      <div
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={cn(
          "w-full rounded-lg glass border border-white/10 px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all cursor-pointer flex items-center justify-between",
          disabled && "opacity-50 cursor-not-allowed"
        )}
      >
        <span className={cn(!displayValue && "text-muted-foreground")}>
          {displayValue || placeholder}
        </span>
        <div className="flex items-center gap-2">
          {value && !disabled && (
            <X
              className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors"
              onClick={handleClear}
            />
          )}
          <ChevronDown
            className={cn(
              "h-4 w-4 text-muted-foreground transition-transform",
              isOpen && "transform rotate-180"
            )}
          />
        </div>
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-2 rounded-lg glass border border-white/10 shadow-xl max-h-60 overflow-hidden">
          {/* Search Input */}
          <div className="p-2 border-b border-white/10">
            <input
              ref={inputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Type to search..."
              className="w-full bg-transparent border-none outline-none text-foreground placeholder:text-muted-foreground px-2 py-1"
            />
          </div>

          {/* Options List */}
          <div className="overflow-y-auto max-h-48">
            {loading ? (
              <div className="px-4 py-3 text-muted-foreground text-center">
                Loading...
              </div>
            ) : filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <div
                  key={option.value}
                  onClick={() => handleSelect(option.value)}
                  className={cn(
                    "px-4 py-2 cursor-pointer transition-colors",
                    "hover:bg-white/10",
                    option.value === value && "bg-purple-500/20 text-purple-300"
                  )}
                >
                  {option.label}
                </div>
              ))
            ) : searchTerm ? (
              <div className="px-4 py-3 text-muted-foreground text-center">
                No results found for "{searchTerm}"
              </div>
            ) : (
              <div className="px-4 py-3 text-muted-foreground text-center">
                No options available
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
