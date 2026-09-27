import React from "react";
import { cn } from "../../lib/utils";

export function Badge({ className, variant = "default", children, ...props }) {
  const variants = {
    default: "bg-teal-50 text-teal-700 border-teal-200/60",
    secondary: "bg-slate-100 text-slate-700 border-slate-200",
    success: "bg-emerald-50 text-emerald-700 border-emerald-200",
    warning: "bg-amber-50 text-amber-700 border-amber-200",
    danger: "bg-rose-50 text-rose-700 border-rose-200",
    ai: "bg-gradient-to-r from-teal-500/10 via-cyan-500/10 to-indigo-500/10 text-teal-800 border-teal-300/50 shadow-sm",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold tracking-wide transition-colors",
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}

export default Badge;
