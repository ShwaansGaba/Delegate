"use client";

import React, { useState, useMemo } from "react";
import { Sheet } from "./Sheet";
import { CountryMonogram } from "./CountryMonogram";

export interface SelectOption {
  id: string;
  name: string;
  code?: string;
  isTaken?: boolean;
  subtitle?: string;
}

interface SearchableSelectProps {
  label?: string;
  value?: string;
  options: SelectOption[];
  onSelect: (option: SelectOption) => void;
  placeholder?: string;
  sheetTitle?: string;
  sheetSubtitle?: string;
  allowCustomNew?: boolean;
  disabled?: boolean;
}

export function SearchableSelect({
  label,
  value,
  options,
  onSelect,
  placeholder = "Select an option",
  sheetTitle = "Select",
  sheetSubtitle,
  allowCustomNew = false,
  disabled = false,
}: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const selectedOption = useMemo(() => {
    return options.find((o) => o.id === value || o.name === value);
  }, [options, value]);

  const filteredOptions = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return options;
    return options.filter(
      (opt) =>
        opt.name.toLowerCase().includes(q) ||
        (opt.code && opt.code.toLowerCase().includes(q))
    );
  }, [options, searchQuery]);

  return (
    <div className="w-full">
      {label && (
        <label className="block text-base sm:text-xl font-heading font-extrabold text-white mb-1.5 sm:mb-2">
          {label}
        </label>
      )}

      {/* Trigger Button/Field styled like white card in design */}
      <div
        onClick={() => !disabled && setIsOpen(true)}
        className={`w-full bg-white text-[#0B1B33] rounded-xl sm:rounded-2xl p-3.5 sm:p-5 text-base sm:text-xl font-medium flex items-center justify-between cursor-pointer select-none transition-colors ${
          disabled ? "opacity-60 cursor-not-allowed" : "hover:bg-neutral-50"
        }`}
      >
        <div className="flex items-center gap-3 truncate">
          {selectedOption?.code && <CountryMonogram code={selectedOption.code} size="sm" />}
          <span className={selectedOption ? "text-[#0B1B33] font-bold" : "text-neutral-500 font-normal"}>
            {selectedOption ? selectedOption.name : placeholder}
          </span>
        </div>
      </div>

      {/* Full screen selection sheet (matches Page 6) */}
      <Sheet
        isOpen={isOpen}
        onClose={() => {
          setIsOpen(false);
          setSearchQuery("");
        }}
        title={sheetTitle}
        subtitle={sheetSubtitle}
      >
        {/* Search Input Box */}
        <div className="mb-3 sm:mb-4">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search..."
            autoFocus
            className="w-full bg-white text-[#0B1B33] rounded-xl sm:rounded-2xl p-3 sm:p-5 text-base sm:text-xl font-medium outline-none placeholder:text-neutral-400"
          />
        </div>

        {/* Options List */}
        <div className="space-y-2 sm:space-y-3 pb-8">
          {allowCustomNew && searchQuery.trim() && !options.some((o) => o.name.toLowerCase() === searchQuery.toLowerCase().trim()) && (
            <button
              type="button"
              onClick={() => {
                onSelect({ id: searchQuery.trim(), name: searchQuery.trim() });
                setIsOpen(false);
                setSearchQuery("");
              }}
              className="w-full bg-white text-[#0B1B33] rounded-xl sm:rounded-2xl p-3.5 sm:p-5 text-left text-base sm:text-xl font-heading font-extrabold hover:bg-neutral-50 active:bg-neutral-100 cursor-pointer"
            >
              Add &ldquo;{searchQuery.trim()}&rdquo; as new
            </button>
          )}

          {filteredOptions.length === 0 && !allowCustomNew && (
            <div className="bg-white/10 rounded-xl sm:rounded-2xl p-4 sm:p-6 text-center text-white text-base sm:text-lg">
              No matching options found.
            </div>
          )}

          {filteredOptions.map((opt) => {
            const isTaken = !!opt.isTaken;
            return (
              <button
                key={opt.id}
                type="button"
                disabled={isTaken}
                onClick={() => {
                  if (!isTaken) {
                    onSelect(opt);
                    setIsOpen(false);
                    setSearchQuery("");
                  }
                }}
                className={`w-full rounded-xl sm:rounded-2xl p-3 sm:p-5 text-left flex items-center justify-between transition-colors select-none ${
                  isTaken
                    ? "bg-[#8cb7ea] text-neutral-600 opacity-80 cursor-not-allowed"
                    : "bg-white text-[#0B1B33] hover:bg-neutral-50 active:bg-neutral-100 cursor-pointer"
                }`}
              >
                <div className="flex items-center gap-3 sm:gap-4">
                  {opt.code && <CountryMonogram code={opt.code} size="md" />}
                  <div>
                    <div className="text-base sm:text-xl font-heading font-extrabold">{opt.name}</div>
                    {opt.subtitle && <div className="text-sm sm:text-base text-neutral-600">{opt.subtitle}</div>}
                  </div>
                </div>
                {isTaken && (
                  <span className="text-sm sm:text-lg font-heading font-bold text-neutral-600 mr-2">Taken</span>
                )}
              </button>
            );
          })}
        </div>
      </Sheet>
    </div>
  );
}
