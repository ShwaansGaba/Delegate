import React from "react";
import { getAssetUrl } from "@/lib/registrationLinks";

interface DelegatoIconProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  rounded?: "md" | "lg" | "xl" | "2xl" | "full";
}

const sizeClasses = {
  sm: "w-7 h-7",
  md: "w-9 h-9",
  lg: "w-12 h-12",
  xl: "w-16 h-16 sm:w-20 sm:h-20",
};

const roundedClasses = {
  md: "rounded-md",
  lg: "rounded-lg",
  xl: "rounded-xl",
  "2xl": "rounded-2xl sm:rounded-3xl",
  full: "rounded-full",
};

export function DelegatoIcon({
  size = "md",
  className = "",
  rounded = "xl",
}: DelegatoIconProps) {
  const iconSrc = getAssetUrl("/branding/delegato-icon.jpg");

  return (
    <div
      className={`relative inline-flex items-center justify-center overflow-hidden shrink-0 shadow-sm border border-white/20 select-none bg-[#0047FF] ${sizeClasses[size]} ${roundedClasses[rounded]} ${className}`}
      title="Delegato"
    >
      <img
        src={iconSrc}
        alt="Delegato"
        className="w-full h-full object-cover"
        loading="eager"
      />
    </div>
  );
}

interface DelegatoWordmarkProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  theme?: "light" | "dark";
}

export function DelegatoWordmark({
  size = "md",
  className = "",
  theme = "light",
}: DelegatoWordmarkProps) {
  const textSize = {
    sm: "text-base font-bold",
    md: "text-xl font-extrabold",
    lg: "text-2xl sm:text-3xl font-extrabold",
    xl: "text-3xl sm:text-4xl font-extrabold",
  }[size];

  const primaryTextColor = theme === "light" ? "text-white" : "text-[#0B1B33]";

  return (
    <span
      className={`font-heading tracking-tight inline-flex items-baseline select-none ${textSize} ${className}`}
    >
      <span className={primaryTextColor}>Deleg</span>
      <span className="text-[#FFD23F]">ato</span>
    </span>
  );
}

interface DelegatoLogoProps {
  size?: "sm" | "md" | "lg";
  iconSize?: "sm" | "md" | "lg" | "xl";
  showWordmark?: boolean;
  theme?: "light" | "dark";
  className?: string;
}

export function DelegatoLogo({
  size = "md",
  iconSize,
  showWordmark = true,
  theme = "light",
  className = "",
}: DelegatoLogoProps) {
  const effectiveIconSize = iconSize || size;

  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      <DelegatoIcon size={effectiveIconSize} />
      {showWordmark && (
        <DelegatoWordmark size={size} theme={theme} />
      )}
    </div>
  );
}
