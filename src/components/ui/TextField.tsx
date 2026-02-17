import { forwardRef, type InputHTMLAttributes, type ReactNode } from "react";

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  type?: string;
  icon?: ReactNode;
  rightIcon?: ReactNode;
}

const TextField = forwardRef<HTMLInputElement, TextFieldProps>(
  ({ label, type = "text", error, icon, rightIcon, ...props }, ref) => {
    return (
      <div className="flex-1">
        {label && (
          <label className="text-dark-400 font-medium text-sm">{label}</label>
        )}
        <div className="relative">
          {icon && (
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-200 pointer-events-none">
              {icon}
            </span>
          )}
          <input
            autoComplete="off"
            ref={ref}
            type={type}
            className={`font-normal border border-dark-100 text-dark-300 placeholder:text-dark-200 outline-none focus:border-primary h-10 text-sm rounded-md ${icon ? "pl-10" : "pl-3"} ${rightIcon ? "pr-10" : "pr-3"} w-full outline-none focus:border-primary h-10 text-sm`}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-200 flex items-center">
              {rightIcon}
            </div>
          )}
        </div>

        {error && (
          <span className="text-sm font-medium text-red-500">{error}</span>
        )}
      </div>
    );
  }
);

TextField.displayName = "TextField";

export default TextField