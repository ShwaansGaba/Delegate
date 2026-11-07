import React from "react";

interface CountryMonogramProps {
  code: string;
  name?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function CountryMonogram({ code, name, size = "md", className = "" }: CountryMonogramProps) {
  const sizeClasses = {
    sm: "w-8 h-8 text-sm",
    md: "w-11 h-11 text-base",
    lg: "w-14 h-14 text-lg",
  };

  const cleanCode = (code || "UN").toUpperCase().slice(0, 4);
  const textScale =
    cleanCode.length >= 4
      ? "text-[9px] sm:text-[10px]"
      : cleanCode.length === 3
      ? "text-[11px] sm:text-xs"
      : sizeClasses[size];

  return (
    <div
      aria-label={name || cleanCode}
      className={`inline-flex items-center justify-center rounded-full bg-[#0F4C96] text-white font-heading font-extrabold flex-shrink-0 tracking-wider ${sizeClasses[size].split(" ")[0]} ${sizeClasses[size].split(" ")[1]} ${textScale} ${className}`}
    >
      {cleanCode}
    </div>
  );
}
