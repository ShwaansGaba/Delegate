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

  const cleanCode = (code || "UN").toUpperCase().slice(0, 2);

  return (
    <div
      aria-label={name || cleanCode}
      className={`inline-flex items-center justify-center rounded-full bg-[#0F4C96] text-white font-heading font-extrabold flex-shrink-0 tracking-wider ${sizeClasses[size]} ${className}`}
    >
      {cleanCode}
    </div>
  );
}
