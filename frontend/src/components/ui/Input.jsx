import React from "react";
import { cn } from "../../lib/utils";

export const Input = React.forwardRef(
  ({ className, type = "text", error, label, ...props }, ref) => {
    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            {label}
          </label>
        )}
        <input
          type={type}
          className={cn(
            "flex h-11 w-full rounded-xl border border-slate-200 bg-white/80 px-3.5 py-2 text-sm text-slate-800 placeholder:text-slate-400 transition-all duration-150 focus:border-teal-500 focus:bg-white focus:outline-none focus:ring-3 focus:ring-teal-500/15 disabled:cursor-not-allowed disabled:opacity-50",
            error && "border-rose-400 focus:border-rose-500 focus:ring-rose-500/15",
            className
          )}
          ref={ref}
          {...props}
        />
        {error && <p className="text-xs font-medium text-rose-500">{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";
export default Input;
