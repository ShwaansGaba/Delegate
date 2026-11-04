import React, { useEffect } from "react";
import { ArrowLeft } from "lucide-react";

interface SheetProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

export function Sheet({ isOpen, onClose, title, subtitle, children }: SheetProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#1560BD] flex flex-col p-6 sm:p-8 overflow-y-auto animate-fadeIn">
      <div className="max-w-md w-full mx-auto flex flex-col flex-1 animate-slideUp">
        {/* Top header with back arrow */}
        <div className="flex items-center gap-4 mb-6">
          <button
            type="button"
            onClick={onClose}
            className="text-white hover:opacity-80 active:opacity-60 hover:-translate-x-1 active:scale-90 transition-transform duration-200 cursor-pointer p-1"
            aria-label="Back"
          >
            <ArrowLeft className="w-8 h-8" strokeWidth={3} />
          </button>
        </div>

        <div className="mb-6">
          <h2 className="text-3xl sm:text-4xl font-heading font-extrabold text-white leading-tight">
            {title}
          </h2>
          {subtitle && <p className="text-xl text-white/90 mt-2 font-medium">{subtitle}</p>}
        </div>

        <div className="flex-1 flex flex-col">{children}</div>
      </div>
    </div>
  );
}
