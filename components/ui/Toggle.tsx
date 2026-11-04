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
      className="bg-white rounded-2xl p-5 flex items-center justify-between cursor-pointer select-none interactive-card active:scale-[0.99] transition-all"
    >
      <div className="pr-4 flex-1">
        <div className="text-xl font-heading font-extrabold text-[#0B1B33]">{label}</div>
        {description && <div className="text-base text-neutral-600 mt-1">{description}</div>}
      </div>
      <div
        className={`w-14 h-8 flex items-center rounded-full p-1 transition-colors duration-300 flex-shrink-0 ${
          checked ? "bg-[#1560BD]" : "bg-neutral-300"
        } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        <div
          className={`bg-white w-6 h-6 rounded-full transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
            checked ? "translate-x-6" : "translate-x-0"
          }`}
        />
      </div>
    </div>
  );
}
