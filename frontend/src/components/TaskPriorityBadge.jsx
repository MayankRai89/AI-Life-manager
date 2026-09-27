import React, { useState } from "react";
import { Info, Sparkles, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "../lib/utils";

/**
 * Normalizes scores on 0-1 or 0-100 scales to a standard 0-1 decimal.
 * 0.8 - 1.0 -> High priority
 * 0.4 - 0.79 -> Medium priority
 * 0.0 - 0.39 -> Low priority
 */
export function getPriorityTier(score) {
  if (score === null || score === undefined || isNaN(score)) {
    return null;
  }
  const normalized = Number(score) > 1 ? Number(score) / 100 : Number(score);

  if (normalized >= 0.8) {
    return {
      tier: "high",
      label: "High priority",
      dotColor: "bg-rose-500",
      dotPing: "bg-rose-400",
      badgeStyle:
        "bg-rose-50/80 text-rose-800 border-rose-200/80 hover:bg-rose-100/80",
      accentBg: "bg-rose-500/10 text-rose-700",
      description: "Best tackled early when your mental energy is at its highest.",
    };
  }

  if (normalized >= 0.4) {
    return {
      tier: "medium",
      label: "Medium priority",
      dotColor: "bg-amber-500",
      dotPing: "bg-amber-400",
      badgeStyle:
        "bg-amber-50/80 text-amber-800 border-amber-200/80 hover:bg-amber-100/80",
      accentBg: "bg-amber-500/10 text-amber-700",
      description: "Good for steady focus once primary tasks are moving.",
    };
  }

  return {
    tier: "low",
    label: "Low priority",
    dotColor: "bg-emerald-500",
    dotPing: "bg-emerald-400",
    badgeStyle:
      "bg-emerald-50/80 text-emerald-800 border-emerald-200/80 hover:bg-emerald-100/80",
    accentBg: "bg-emerald-500/10 text-emerald-700",
    description: "Low-friction item, ideal for low-energy or wind-down moments.",
  };
}

/**
 * TaskPriorityBadge Component
 *
 * Translates raw AI scores (0.85) into human-friendly priorities:
 * - High priority (red/orange dot)
 * - Medium priority (yellow/amber dot)
 * - Low priority (green dot)
 *
 * Includes an expandable "why?" affordance revealing AI's reasoning without cluttering the UI.
 */
export function TaskPriorityBadge({
  score,
  reason,
  isLoading = false,
  showWhyAffordance = true,
  className = "",
  inline = false,
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (isLoading) {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full border border-slate-200/80 bg-slate-50 px-2.5 py-1 text-[11px] font-medium text-slate-500 animate-pulse",
          className
        )}
      >
        <span className="h-1.5 w-1.5 rounded-full bg-slate-300 animate-ping" />
        <span>Gauging priority...</span>
      </span>
    );
  }

  const priorityInfo = getPriorityTier(score);
  if (!priorityInfo) return null;

  const toggleWhy = (e) => {
    e.stopPropagation();
    setIsExpanded((prev) => !prev);
  };

  return (
    <div className={cn("inline-flex flex-col", inline ? "inline-block" : "", className)}>
      <div className="inline-flex items-center gap-1.5">
        {/* Main Human-Friendly Priority Pill */}
        <span
          className={cn(
            "group inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold tracking-tight transition-all duration-200",
            priorityInfo.badgeStyle
          )}
          title={`Priority determined by energy window and cognitive demand`}
        >
          {/* Visual Dot Indicator */}
          <span className="relative flex h-2 w-2">
            <span
              className={cn(
                "absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping duration-1000",
                priorityInfo.dotPing
              )}
            />
            <span
              className={cn(
                "relative inline-flex h-2 w-2 rounded-full",
                priorityInfo.dotColor
              )}
            />
          </span>

          <span>{priorityInfo.label}</span>
        </span>

        {/* Lightweight "Why?" / (i) Affordance */}
        {showWhyAffordance && (reason || priorityInfo.description) && (
          <button
            type="button"
            onClick={toggleWhy}
            aria-expanded={isExpanded}
            aria-label="Why this priority?"
            className={cn(
              "inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-[10px] font-medium transition cursor-pointer select-none",
              isExpanded
                ? "bg-slate-200/80 text-slate-800"
                : "text-slate-400 hover:text-teal-700 hover:bg-slate-100"
            )}
          >
            <Info className="h-3 w-3" />
            <span className="hidden sm:inline">why?</span>
            {isExpanded ? (
              <ChevronUp className="h-2.5 w-2.5" />
            ) : (
              <ChevronDown className="h-2.5 w-2.5" />
            )}
          </button>
        )}
      </div>

      {/* Expandable Reasoning Popout / Accordion */}
      {isExpanded && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="mt-2 w-full max-w-sm rounded-xl border border-teal-100 bg-gradient-to-br from-teal-50/90 to-cyan-50/70 p-2.5 text-[11px] text-slate-700 shadow-sm animate-in fade-in slide-in-from-top-1 duration-150"
        >
          <div className="flex items-start gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-teal-600 mt-0.5 shrink-0" />
            <div className="space-y-1">
              <div className="flex items-center justify-between gap-2">
                <span className="font-semibold text-teal-900">
                  Why this is marked {priorityInfo.label.toLowerCase()}:
                </span>
                <button
                  type="button"
                  onClick={toggleWhy}
                  className="text-slate-400 hover:text-slate-600 text-[10px] cursor-pointer"
                >
                  Close
                </button>
              </div>
              <p className="text-slate-600 leading-snug">
                {reason || priorityInfo.description}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TaskPriorityBadge;
