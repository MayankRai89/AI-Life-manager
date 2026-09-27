import React from "react";
import { cn } from "../../lib/utils";

export const Button = React.forwardRef(
  (
    {
      className,
      variant = "default",
      size = "default",
      isLoading = false,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center rounded-xl text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/40 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] cursor-pointer select-none";

    const variants = {
      default:
        "bg-teal-600 text-white shadow-sm hover:bg-teal-700 hover:shadow-md hover:shadow-teal-600/10",
      secondary:
        "bg-slate-100 text-slate-800 hover:bg-slate-200 border border-slate-200/60",
      outline:
        "border border-slate-200 bg-white/80 hover:bg-slate-50 text-slate-700 shadow-sm",
      ghost: "hover:bg-slate-100 text-slate-600 hover:text-slate-900",
      calm: "bg-teal-50 text-teal-700 hover:bg-teal-100/80 border border-teal-200/60 font-semibold",
      danger: "bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200",
    };

    const sizes = {
      default: "h-10 px-4 py-2",
      sm: "h-8 rounded-lg px-3 text-xs",
      lg: "h-12 rounded-xl px-6 text-base",
      icon: "h-9 w-9",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading && (
          <svg
            className="mr-2 h-4 w-4 animate-spin text-current"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
export default Button;
