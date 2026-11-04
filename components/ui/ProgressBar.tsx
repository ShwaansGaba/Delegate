import React from "react";
import { ArrowLeft } from "lucide-react";

interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
  onBack?: () => void;
  showBack?: boolean;
  className?: string;
}

export function ProgressBar({
  currentStep,
  totalSteps,
  onBack,
  showBack = true,
  className = "",
}: ProgressBarProps) {
  const percentage = Math.min(100, Math.max(0, (currentStep / totalSteps) * 100));

  return (
    <div className={`w-full flex items-center gap-4 py-3 select-none ${className}`}>
      {showBack && (
        <button
          type="button"
          onClick={onBack}
          aria-label="Go back"
          className="text-white hover:opacity-80 active:opacity-60 flex-shrink-0 cursor-pointer p-1"
        >
          <ArrowLeft className="w-7 h-7" strokeWidth={3} />
        </button>
      )}
      <div className="flex-1 bg-[#0F4C96] h-2 rounded-full overflow-hidden">
        <div
          className="bg-[#FFD23F] h-full transition-all duration-300 rounded-full"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
