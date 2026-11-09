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
  const iconSrc = getAssetUrl("/branding/delegato-icon-tight.jpg");

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

export function DelegatoHorizontalLogo({
  className = "h-8 sm:h-10 w-auto",
}: {
  className?: string;
}) {
  const logoSrc = getAssetUrl("/branding/delegato-logo-transparent.png");
  return (
    <img
      src={logoSrc}
      alt="Delegato"
      className={`object-contain select-none ${className}`}
      loading="eager"
    />
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
}: DelegatoWordmarkProps) {
  const textSize = {
    sm: "text-base font-bold",
    md: "text-xl font-extrabold",
    lg: "text-2xl sm:text-3xl font-extrabold",
    xl: "text-3xl sm:text-4xl font-extrabold",
  }[size];

  return (
    <span
      className={`font-heading tracking-tight inline-flex items-baseline select-none font-extrabold text-[#FFD23F] ${textSize} ${className}`}
      style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
    >
      Delegato
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
  className = "",
}: DelegatoLogoProps) {
  const heightClass = {
    sm: "h-6 sm:h-7",
    md: "h-8 sm:h-10",
    lg: "h-12 sm:h-14",
    xl: "h-16 sm:h-20",
  }[size || "md"];

  return (
    <DelegatoHorizontalLogo className={`${heightClass} ${className}`} />
  );
}
