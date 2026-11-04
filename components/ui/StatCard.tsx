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
      className={`bg-white text-[#0B1B33] rounded-2xl p-5 ${
        onClick ? "cursor-pointer hover:bg-neutral-50 active:bg-neutral-100 interactive-card" : "animate-fadeIn"
      } ${className}`}
    >
      <div className="text-4xl sm:text-5xl font-heading font-extrabold tracking-tight">
        {value}
      </div>
      <div className="text-lg font-heading font-bold text-neutral-600 mt-1">
        {label}
      </div>
    </div>
  );
}
