import React from "react";

interface ToggleProps {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

export function Toggle({ label, description, checked, onChange, disabled }: ToggleProps) {
  return (
    <div
      onClick={() => !disabled && onChange(!checked)}
      className="bg-white border border-neutral-100 rounded-xl sm:rounded-2xl p-3 sm:p-4 flex items-center justify-between cursor-pointer select-none interactive-card active:scale-[0.99] transition-all shadow-xs"
    >
      <div className="pr-3 flex-1">
        <div className="text-sm sm:text-base font-heading font-extrabold text-[#0B1B33]">{label}</div>
        {description && <div className="text-xs sm:text-sm text-neutral-600 mt-0.5">{description}</div>}
      </div>
      <div
        className={`w-12 h-7 sm:w-14 sm:h-8 flex items-center rounded-full p-1 transition-colors duration-300 flex-shrink-0 ${
          checked ? "bg-[#1560BD]" : "bg-neutral-300"
        } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        <div
          className={`bg-white w-5 h-5 sm:w-6 sm:h-6 rounded-full transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
            checked ? "translate-x-5 sm:translate-x-6" : "translate-x-0"
          }`}
        />
      </div>
    </div>
  );
}
