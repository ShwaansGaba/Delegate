"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { MASTER_PORTFOLIO_LIST, PortfolioItem } from "@/lib/portfolioDatabase";
import { CountryMonogram } from "./CountryMonogram";
import { Plus } from "lucide-react";

interface PortfolioComboboxProps {
  onAdd: (item: { name: string; code: string }) => void;
  existingNames?: string[];
  placeholder?: string;
}

export function PortfolioCombobox({
  onAdd,
  existingNames = [],
  placeholder = "Search country or Indian politician (e.g. India, Amit Shah)...",
}: PortfolioComboboxProps) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const existingSet = useMemo(() => new Set(existingNames.map((n) => n.toLowerCase())), [existingNames]);

  const filteredItems = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return MASTER_PORTFOLIO_LIST.slice(0, 15);
    return MASTER_PORTFOLIO_LIST.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        item.code.toLowerCase().includes(q) ||
        (item.designation && item.designation.toLowerCase().includes(q))
    ).slice(0, 30);
  }, [query]);

  // Handle clicking outside to close
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (item: PortfolioItem) => {
    onAdd({ name: item.name, code: item.code });
    setQuery("");
    setIsOpen(false);
  };

  const handleCustomAdd = () => {
    if (!query.trim()) return;
    const cleanName = query.trim();
    const match = cleanName.match(/\(([^)]+)\)/);
    const code = match ? match[1].slice(0, 5).toUpperCase() : cleanName.slice(0, 3).toUpperCase();
    onAdd({ name: cleanName, code });
    setQuery("");
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                if (filteredItems.length > 0) {
                  handleSelect(filteredItems[0]);
                } else if (query.trim()) {
                  handleCustomAdd();
                }
              }
            }}
            placeholder={placeholder}
            className="w-full bg-neutral-100 rounded-2xl p-4 text-xl font-bold outline-none placeholder:text-neutral-400 placeholder:font-normal focus:ring-2 focus:ring-[#1560BD]"
          />
        </div>

        <button
          type="button"
          onClick={() => {
            if (filteredItems.length > 0 && query.trim()) {
              handleSelect(filteredItems[0]);
            } else if (query.trim()) {
              handleCustomAdd();
            }
          }}
          disabled={!query.trim()}
          className="bg-[#1560BD] hover:bg-[#0F4C96] active:scale-95 disabled:opacity-40 text-white px-6 py-4 rounded-2xl font-heading font-extrabold text-lg flex items-center gap-2 cursor-pointer transition-all duration-150"
        >
          <Plus className="w-5 h-5 stroke-[3] group-hover:rotate-90 transition-transform duration-200" /> Add
        </button>
      </div>

      {/* Combobox Dropdown List */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-2 z-50 bg-white border-2 border-[#1560BD] rounded-2xl max-h-72 overflow-y-auto divide-y divide-neutral-100 animate-scaleIn origin-top">
          {filteredItems.map((item) => {
            const isAlreadyAdded = existingSet.has(item.name.toLowerCase());
            return (
              <button
                key={`${item.code}-${item.name}`}
                type="button"
                disabled={isAlreadyAdded}
                onClick={() => handleSelect(item)}
                className={`w-full p-3.5 text-left flex items-center justify-between transition-all duration-150 ${
                  isAlreadyAdded
                    ? "opacity-40 bg-neutral-50 cursor-not-allowed"
                    : "hover:bg-blue-50 hover:pl-5 cursor-pointer"
                }`}
              >
                <div className="flex items-center gap-3">
                  <CountryMonogram code={item.code} size="sm" />
                  <div>
                    <div className="text-lg font-heading font-extrabold text-[#0B1B33]">
                      {item.name}
                    </div>
                    {item.designation && (
                      <div className="text-xs text-neutral-500 font-medium">
                        {item.designation}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs uppercase font-extrabold px-2 py-0.5 rounded-md ${
                      item.category === "politician"
                        ? "bg-amber-100 text-amber-800"
                        : item.category === "party"
                        ? "bg-purple-100 text-purple-800"
                        : item.category === "regional"
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {item.category === "politician"
                      ? "Leader"
                      : item.category === "party"
                      ? "Party"
                      : item.category === "regional"
                      ? "Bloc"
                      : "Country"}
                  </span>
                  {isAlreadyAdded && (
                    <span className="text-sm font-bold text-neutral-400">Added</span>
                  )}
                </div>
              </button>
            );
          })}

          {query.trim() &&
            !filteredItems.some((f) => f.name.toLowerCase() === query.trim().toLowerCase()) && (
              <button
                type="button"
                onClick={handleCustomAdd}
                className="w-full p-4 text-left font-heading font-extrabold text-[#1560BD] hover:bg-neutral-50 flex items-center gap-2 cursor-pointer"
              >
                <Plus className="w-5 h-5 stroke-[3]" /> Add &ldquo;{query.trim()}&rdquo; as custom
              </button>
            )}
        </div>
      )}
    </div>
  );
}
