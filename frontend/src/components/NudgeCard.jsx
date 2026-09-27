import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { dismissNudge, restoreNudge } from "../redux/slices/aiSlice";
import {
  Apple,
  Footprints,
  Moon,
  Droplets,
  HeartHandshake,
  Sparkles,
  X,
  Check,
  RotateCcw,
  Clock,
} from "lucide-react";
import { cn } from "../lib/utils";

/**
 * Visual configuration for each wellness nudge category.
 * Categories: eat, move, rest, hydrate, encouragement
 */
export const NUDGE_CATEGORIES = {
  eat: {
    label: "Nourish",
    tagline: "Fuel your mind",
    icon: Apple,
    theme: {
      border: "border-amber-200/80",
      bg: "bg-gradient-to-r from-amber-50/90 via-orange-50/60 to-amber-50/40",
      badge: "bg-amber-100 text-amber-800 border-amber-200/60",
      iconBox: "bg-amber-500/10 text-amber-700",
      actionBtn:
        "bg-amber-600 text-white hover:bg-amber-700 shadow-xs focus:ring-amber-400",
      accentGlow: "shadow-amber-500/5",
    },
  },
  move: {
    label: "Movement",
    tagline: "Unfreeze your body",
    icon: Footprints,
    theme: {
      border: "border-sky-200/80",
      bg: "bg-gradient-to-r from-sky-50/90 via-indigo-50/50 to-blue-50/40",
      badge: "bg-sky-100 text-sky-800 border-sky-200/60",
      iconBox: "bg-sky-500/10 text-sky-700",
      actionBtn:
        "bg-sky-600 text-white hover:bg-sky-700 shadow-xs focus:ring-sky-400",
      accentGlow: "shadow-sky-500/5",
    },
  },
  rest: {
    label: "Rest & Recovery",
    tagline: "Pause and breathe",
    icon: Moon,
    theme: {
      border: "border-violet-200/80",
      bg: "bg-gradient-to-r from-violet-50/90 via-purple-50/50 to-indigo-50/40",
      badge: "bg-violet-100 text-violet-800 border-violet-200/60",
      iconBox: "bg-violet-500/10 text-violet-700",
      actionBtn:
        "bg-violet-600 text-white hover:bg-violet-700 shadow-xs focus:ring-violet-400",
      accentGlow: "shadow-violet-500/5",
    },
  },
  hydrate: {
    label: "Hydration",
    tagline: "Simple refreshment",
    icon: Droplets,
    theme: {
      border: "border-teal-200/80",
      bg: "bg-gradient-to-r from-teal-50/90 via-cyan-50/60 to-emerald-50/40",
      badge: "bg-teal-100 text-teal-800 border-teal-200/60",
      iconBox: "bg-teal-500/10 text-teal-700",
      actionBtn:
        "bg-teal-600 text-white hover:bg-teal-700 shadow-xs focus:ring-teal-400",
      accentGlow: "shadow-teal-500/5",
    },
  },
  encouragement: {
    label: "Gentle Reminder",
    tagline: "Kindness for yourself",
    icon: HeartHandshake,
    theme: {
      border: "border-rose-200/80",
      bg: "bg-gradient-to-r from-rose-50/90 via-pink-50/50 to-teal-50/40",
      badge: "bg-rose-100 text-rose-800 border-rose-200/60",
      iconBox: "bg-rose-500/10 text-rose-700",
      actionBtn:
        "bg-rose-600 text-white hover:bg-rose-700 shadow-xs focus:ring-rose-400",
      accentGlow: "shadow-rose-500/5",
    },
  },
  default: {
    label: "Wellness Nudge",
    tagline: "A gentle check-in",
    icon: Sparkles,
    theme: {
      border: "border-teal-200/80",
      bg: "bg-gradient-to-r from-teal-50/80 via-emerald-50/50 to-white",
      badge: "bg-teal-100 text-teal-800 border-teal-200/60",
      iconBox: "bg-teal-500/10 text-teal-700",
      actionBtn:
        "bg-teal-600 text-white hover:bg-teal-700 shadow-xs focus:ring-teal-400",
      accentGlow: "shadow-teal-500/5",
    },
  },
};

/**
 * NudgeCard Component
 *
 * Gives AI nudges "a moment of their own" with a warm, non-intrusive card
 * rather than a fleeting corner toast.
 *
 * Supports structured JSON:
 * - { nudge: "Take a sip of water...", category: "hydrate" }
 * or redux latestNudge:
 * - { title, message, category }
 */
export function NudgeCard({
  nudge: propNudge,
  category: propCategory,
  onDismiss: propOnDismiss,
  onAction: propOnAction,
  className = "",
  allowRestore = true,
}) {
  const dispatch = useDispatch();
  const reduxState = useSelector((state) => state?.ai) || {};
  const { latestNudge, isNudgeDismissed } = reduxState;

  const [isCompleted, setIsCompleted] = useState(false);
  const [isLocallyDismissed, setIsLocallyDismissed] = useState(false);

  // Derive active content from props or redux
  const activeNudgeData = propNudge || latestNudge;
  const isDismissed =
    propNudge !== undefined ? isLocallyDismissed : isNudgeDismissed;

  if (!activeNudgeData) return null;

  // Extract message and category gracefully
  const messageText =
    typeof activeNudgeData === "string"
      ? activeNudgeData
      : activeNudgeData.nudge ||
        activeNudgeData.message ||
        "Remember to pace yourself today.";

  const titleText =
    typeof activeNudgeData === "object" ? activeNudgeData.title : null;

  const rawCategory =
    propCategory ||
    (typeof activeNudgeData === "object" ? activeNudgeData.category : null) ||
    "default";

  // Normalize category key to match eat, move, rest, hydrate, encouragement
  const normalizedCategoryKey = String(rawCategory).toLowerCase();
  const categoryConfig =
    NUDGE_CATEGORIES[normalizedCategoryKey] || NUDGE_CATEGORIES.default;

  const CategoryIcon = categoryConfig.icon;

  const handleDismiss = () => {
    if (propOnDismiss) {
      propOnDismiss();
    } else {
      dispatch(dismissNudge());
    }
    setIsLocallyDismissed(true);
  };

  const handleRestore = () => {
    setIsLocallyDismissed(false);
    setIsCompleted(false);
    dispatch(restoreNudge());
  };

  const handleAction = () => {
    setIsCompleted(true);
    if (propOnAction) {
      propOnAction();
    }
    // Auto dismiss with celebration after short pause
    setTimeout(() => {
      handleDismiss();
    }, 2400);
  };

  if (isDismissed) {
    if (!allowRestore) return null;
    return (
      <div className="flex justify-end pb-2">
        <button
          type="button"
          onClick={handleRestore}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-teal-700 transition cursor-pointer"
        >
          <RotateCcw className="h-3 w-3" />
          <span>Show wellness nudge</span>
        </button>
      </div>
    );
  }

  return (
    <div
      role="region"
      aria-label="Daily wellness nudge"
      className={cn(
        "relative overflow-hidden rounded-2xl border p-4.5 transition-all duration-300 shadow-xs",
        categoryConfig.theme.border,
        categoryConfig.theme.bg,
        categoryConfig.theme.accentGlow,
        className
      )}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Left: Category Icon & Message */}
        <div className="flex items-start gap-3.5 min-w-0 flex-1">
          <div
            className={cn(
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-105",
              categoryConfig.theme.iconBox
            )}
          >
            <CategoryIcon className="h-5 w-5" />
          </div>

          <div className="space-y-1 min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={cn(
                  "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider border",
                  categoryConfig.theme.badge
                )}
              >
                <CategoryIcon className="h-2.5 w-2.5" />
                {categoryConfig.label}
              </span>

              {titleText && (
                <span className="text-xs font-semibold text-slate-700 truncate">
                  {titleText}
                </span>
              )}
            </div>

            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-normal">
              {messageText}
            </p>
          </div>
        </div>

        {/* Right: Actions & Dismiss Button */}
        <div className="flex items-center gap-2.5 self-end sm:self-center shrink-0">
          {isCompleted ? (
            <div className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-100/90 px-3 py-1.5 text-xs font-semibold text-emerald-800 border border-emerald-200 animate-in fade-in zoom-in-95">
              <Check className="h-3.5 w-3.5 text-emerald-600" />
              <span>Great job taking a moment!</span>
            </div>
          ) : (
            <>
              <button
                type="button"
                onClick={handleAction}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-medium transition cursor-pointer active:scale-98",
                  categoryConfig.theme.actionBtn
                )}
              >
                <Check className="h-3.5 w-3.5" />
                <span>I did this</span>
              </button>

              <button
                type="button"
                onClick={handleDismiss}
                aria-label="Dismiss wellness nudge"
                className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-200/50 hover:text-slate-600 transition cursor-pointer"
                title="Dismiss"
              >
                <X className="h-4 w-4" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default NudgeCard;
