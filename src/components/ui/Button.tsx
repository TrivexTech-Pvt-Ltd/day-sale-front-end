
import clsx from "clsx";
import type { ReactNode } from "react";

interface ButtonProps {
  label?: ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "danger" | "outline";
  size?: "small" | "medium" | "large";
  icon?: ReactNode;
  disabled?: boolean;
  className?: string;
  type?: "button" | "submit";
}

const Button = ({
  label,
  onClick,
  variant = "primary",
  size = "medium",
  icon,
  disabled = false,
  className,
  type = "button",
}: ButtonProps) => {
  const buttonClasses = clsx(
    "flex items-center justify-center font-medium text-sm cursor-pointer rounded-md transition focus:outline-none",
    {
      /* ===== Variants ===== */
      "bg-primary text-white hover:bg-primaryDark": variant === "primary",

      "bg-gray-100 text-gray-700 hover:bg-gray-200": variant === "secondary",

      "bg-[#D22B2B] text-white hover:bg-red-600 focus:ring-2 focus:ring-red-400":
        variant === "danger",

      "border border-gray-300 text-gray-700 hover:bg-gray-50":
        variant === "outline",

      /* ===== Sizes ===== */
      "text-sm px-3 py-1.5": size === "small",
      "text-base px-5 py-2.5": size === "medium",
      "text-lg px-6 py-3": size === "large",

      /* ===== Disabled ===== */
      "opacity-50 pointer-events-none": disabled,
    },
    className
  );

  return (
    <button
      type={type}
      className={buttonClasses}
      onClick={onClick}
      disabled={disabled}
    >
      {icon && <span className="mr-2 flex items-center">{icon}</span>}
      {label}
    </button>
  );
};

export default Button;
