"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ChevronDown } from "lucide-react";

interface AutocompleteOption {
  value: string;
  label: string;
}

interface AutocompleteInputProps {
  value: string;
  onChange: (value: string) => void;
  options: AutocompleteOption[];
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  loading?: boolean;
}

export function AutocompleteInput({
  value,
  onChange,
  options,
  placeholder = "Type or select...",
  className = "",
  disabled = false,
  loading = false,
}: AutocompleteInputProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const [filteredOptions, setFilteredOptions] = useState(options);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Update input value when prop changes
  useEffect(() => {
    // Find the option that matches the current value
    const matchingOption = options.find(opt => opt.value === value);
    if (matchingOption) {
      setInputValue(matchingOption.label);
    } else if (value) {
      // If value is set but no matching option, use the value itself
      setInputValue(value);
    } else {
      setInputValue("");
    }
  }, [value, options]);

  // Filter options based on input
  useEffect(() => {
    if (inputValue.trim() === "") {
      setFilteredOptions(options);
    } else {
      const filtered = options.filter((option) =>
        option.label.toLowerCase().includes(inputValue.toLowerCase())
      );
      setFilteredOptions(filtered);
    }
  }, [inputValue, options]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    onChange(newValue);
    setIsOpen(true);
  };

  const handleSelectOption = (option: AutocompleteOption) => {
    setInputValue(option.label);
    onChange(option.value);
    setIsOpen(false);
    inputRef.current?.blur();
  };

  const handleInputFocus = () => {
    setIsOpen(true);
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Input Field */}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={loading ? "Loading..." : inputValue}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          placeholder={placeholder}
          disabled={disabled || loading}
          className="w-full px-4 py-3 bg-background/50 backdrop-blur-sm border border-border rounded-lg 
                   text-foreground placeholder:text-muted-foreground
                   focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50
                   transition-all duration-200
                   disabled:opacity-50 disabled:cursor-not-allowed"
        />
        <ChevronDown
          className={`absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground 
                     transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        />
      </div>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && filteredOptions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute z-50 w-full mt-2 bg-background/95 backdrop-blur-xl border border-border 
                     rounded-lg shadow-2xl overflow-hidden"
          >
            <div className="max-h-60 overflow-y-auto">
              {filteredOptions.map((option, index) => {
                const isSelected = value === option.value;
                return (
                  <motion.button
                    key={option.value}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.03 }}
                    onClick={() => handleSelectOption(option)}
                    className={`w-full px-4 py-3 text-left flex items-center justify-between gap-3
                             transition-all duration-200 group
                             ${
                               isSelected
                                 ? "bg-purple-500/20 text-purple-400"
                                 : "hover:bg-purple-500/10 text-foreground"
                             }`}
                  >
                    <span className="text-sm font-medium">{option.label}</span>
                    {isSelected && (
                      <Check className="w-4 h-4 text-purple-400" />
                    )}
                  </motion.button>
                );
              })}
            </div>

            {/* No results message */}
            {filteredOptions.length === 0 && inputValue.trim() !== "" && (
              <div className="px-4 py-6 text-center text-muted-foreground text-sm">
                No matches found. Press Enter to use "{inputValue}"
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
