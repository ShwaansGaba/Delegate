import React from "react";

interface StatCardProps {
  value: number | string;
  label: string;
  onClick?: () => void;
  className?: string;
}

export function StatCard({ value, label, onClick, className = "" }: StatCardProps) {
  return (
    <div
      onClick={onClick}
      className={`organizer-card theme-card bg-white text-[#0B1B33] rounded-xl sm:rounded-2xl p-3.5 sm:p-5 ${
        onClick ? "cursor-pointer hover:bg-neutral-50 active:bg-neutral-100 interactive-card" : "animate-fadeIn"
      } ${className}`}
    >
      <div className="text-2xl sm:text-4xl font-heading font-extrabold tracking-tight">
        {value}
      </div>
      <div className="text-xs sm:text-base font-heading font-bold text-neutral-600 mt-0.5">
        {label}
      </div>
    </div>
  );
}
