import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "white" | "outline" | "link";
  size?: "lg" | "md";
  fullWidth?: boolean;
  children: React.ReactNode;
}

export function Button({
  type = "button",
  variant = "primary",
  size = "lg",
  fullWidth = true,
  children,
  className = "",
  disabled,
  ...props
}: ButtonProps) {
  const baseClasses =
    "inline-flex items-center justify-center font-heading font-extrabold tactile-btn active:scale-[0.97] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none select-none text-center cursor-pointer";

  const sizeClasses =
    size === "lg"
      ? "py-3 px-5 text-base sm:py-4 sm:px-6 sm:text-lg rounded-xl sm:rounded-2xl min-h-[48px] sm:min-h-[56px]"
      : "py-2.5 px-4 text-base rounded-lg sm:rounded-xl min-h-[44px]";

  const variantClasses = {
    primary: "bg-[#FFD23F] text-[#0B1B33] hover:bg-[#F5C830] active:bg-[#E8BC26]",
    white: "bg-white text-[#0B1B33] hover:bg-neutral-100 active:bg-neutral-200",
    outline: "border-2 border-white text-white hover:bg-white/10 active:bg-white/20",
    link: "text-[#FFD23F] underline bg-transparent p-0 min-h-0 font-bold hover:text-white",
  };

  const widthClass = fullWidth ? "w-full" : "";

  return (
    <button
      type={type}
      className={`${baseClasses} ${sizeClasses} ${variantClasses[variant]} ${widthClass} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
