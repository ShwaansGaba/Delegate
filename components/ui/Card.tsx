import React from "react";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  clickable?: boolean;
}

export function Card({ children, className = "", onClick, clickable = false, ...props }: CardProps) {
  const isClickable = clickable || !!onClick;
  return (
    <div
      onClick={onClick}
      className={`organizer-card theme-card bg-white text-[#0B1B33] rounded-2xl p-5 ${
        isClickable ? "cursor-pointer hover:bg-neutral-50 active:bg-neutral-100 interactive-card transition-colors" : ""
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
