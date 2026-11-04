import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface RowProps {
  title: string;
  subtitle?: string;
  rightBadge?: string | React.ReactNode;
  showArrow?: boolean;
  href?: string;
  onClick?: () => void;
  className?: string;
}

export function Row({
  title,
  subtitle,
  rightBadge,
  showArrow = true,
  href,
  onClick,
  className = "",
}: RowProps) {
  const content = (
    <div
      className={`group bg-white text-[#0B1B33] rounded-2xl p-5 flex items-center justify-between interactive-card select-none ${
        href || onClick ? "cursor-pointer hover:bg-neutral-50 active:bg-neutral-100" : ""
      } ${className}`}
      onClick={onClick}
    >
      <div className="flex-1 pr-4">
        <div className="text-xl font-heading font-extrabold text-[#0B1B33]">{title}</div>
        {subtitle && <div className="text-base text-neutral-600 mt-0.5">{subtitle}</div>}
      </div>
      <div className="flex items-center gap-3 flex-shrink-0">
        {rightBadge && typeof rightBadge === "string" ? (
          <span className="text-lg font-heading font-bold text-[#0B1B33]">{rightBadge}</span>
        ) : (
          rightBadge
        )}
        {showArrow && (
          <ArrowRight
            className="w-6 h-6 text-[#0B1B33] group-hover:translate-x-1.5 transition-transform duration-200"
            strokeWidth={2.5}
          />
        )}
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block w-full">
        {content}
      </Link>
    );
  }

  return content;
}
