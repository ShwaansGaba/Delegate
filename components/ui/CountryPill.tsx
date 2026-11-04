"use client";

import React, { useState } from "react";
import { X, Check } from "lucide-react";

export type AllotmentStatus = "free" | "allotted_paid" | "allotted_unpaid";

interface CountryPillProps {
  id: string;
  name: string;
  code: string;
  status?: AllotmentStatus;
  allottedDelegateName?: string;
  isSelected?: boolean;
  onToggleSelect?: (id: string) => void;
  onDelete?: (id: string) => void;
  showCheckbox?: boolean;
  className?: string;
}

export function CountryPill({
  id,
  name,
  code,
  status = "free",
  allottedDelegateName,
  isSelected = false,
  onToggleSelect,
  onDelete,
  showCheckbox = true,
  className = "",
}: CountryPillProps) {
  const [isCircleHovered, setIsCircleHovered] = useState(false);

  // Status background and border colors for Allotment
  const statusStyles = {
    free: "bg-emerald-50/90 border-emerald-300 text-emerald-950",
    allotted_paid: "bg-blue-50/90 border-blue-400 text-blue-950",
    allotted_unpaid: "bg-amber-50/90 border-amber-300 text-amber-950",
  };

  const statusBadge = {
    free: { label: "Free", color: "bg-emerald-600 text-white" },
    allotted_paid: { label: "Allotted & Paid", color: "bg-blue-700 text-white" },
    allotted_unpaid: { label: "Allotted, Unpaid", color: "bg-amber-600 text-white" },
  };

  return (
    <div
      onClick={(e) => {
        // Only toggle selection if clicking outside the delete circle
        if (onToggleSelect && !isCircleHovered) {
          onToggleSelect(id);
        }
      }}
      className={`relative group inline-flex items-center gap-3 pl-2 pr-5 py-2.5 rounded-full border-2 transition-all duration-200 hover:-translate-y-0.5 active:scale-95 animate-fadeIn select-none cursor-pointer ${
        isSelected
          ? "ring-2 ring-[#FFD23F] bg-blue-100 border-[#1560BD]"
          : statusStyles[status]
      } ${className}`}
    >
      {/* Circle monogram that turns into a delete cross on hover */}
      <div
        onMouseEnter={() => setIsCircleHovered(true)}
        onMouseLeave={() => setIsCircleHovered(false)}
        onClick={(e) => {
          e.stopPropagation();
          if (onDelete) {
            onDelete(id);
          }
        }}
        title="Delete country"
        className={`w-9 h-9 rounded-full flex items-center justify-center font-heading font-extrabold text-sm transition-all duration-300 ease-out cursor-pointer flex-shrink-0 ${
          isCircleHovered
            ? "bg-red-600 text-white rotate-90 scale-105"
            : "bg-[#0F4C96] text-white rotate-0 scale-100"
        }`}
      >
        {isCircleHovered ? (
          <X className="w-5 h-5 stroke-[3] animate-pop" />
        ) : (
          code.slice(0, 2).toUpperCase()
        )}
      </div>

      {/* Country Name & Delegate if allotted */}
      <div className="flex flex-col">
        <span className="text-base font-heading font-extrabold leading-tight">
          {name}
        </span>
        {allottedDelegateName && (
          <span className="text-xs text-neutral-600 font-bold truncate max-w-[120px]">
            {allottedDelegateName}
          </span>
        )}
      </div>

      {/* Status indicator badge (for allotment view) */}
      {status !== "free" && (
        <span
          className={`text-[11px] font-extrabold uppercase px-2 py-0.5 rounded-full animate-scaleIn ${statusBadge[status].color}`}
        >
          {statusBadge[status].label}
        </span>
      )}

      {/* Small Checkbox on top-right for multi-select */}
      {showCheckbox && onToggleSelect && (
        <div
          onClick={(e) => {
            e.stopPropagation();
            onToggleSelect(id);
          }}
          className={`w-5 h-5 rounded border flex items-center justify-center transition-all duration-200 active:scale-75 cursor-pointer ${
            isSelected
              ? "bg-[#1560BD] border-[#1560BD] text-white scale-100"
              : "bg-white border-neutral-300 opacity-60 group-hover:opacity-100 hover:border-[#1560BD] hover:scale-105"
          }`}
        >
          {isSelected && <Check className="w-3.5 h-3.5 stroke-[3] animate-pop" />}
        </div>
      )}
    </div>
  );
}
