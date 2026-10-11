import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { dismissNudge } from "../redux/slices/aiSlice";
import {
  Apple,
  Footprints,
  Moon,
  Droplets,
  HeartHandshake,
  Sparkles,
  X,
  Check,
  Clock,
} from "lucide-react";
import { cn } from "../lib/utils";

const STORAGE_DISMISSED_KEY = "ai_life_nudge_dismissed_at";

export const NUDGE_CATEGORIES = {
  eat: {
    label: "Nourish",
    icon: Apple,
    border: "border-amber-200/80",
    bg: "bg-gradient-to-r from-amber-50/90 via-orange-50/60 to-amber-50/40",
    badge: "bg-amber-100 text-amber-800 border-amber-200/60",
    iconBox: "bg-amber-500/10 text-amber-700",
    actionBtn: "bg-amber-600 text-white hover:bg-amber-700 focus:ring-amber-400",
  },
  move: {
    label: "Movement",
    icon: Footprints,
    border: "border-sky-200/80",
    bg: "bg-gradient-to-r from-sky-50/90 via-indigo-50/50 to-blue-50/40",
    badge: "bg-sky-100 text-sky-800 border-sky-200/60",
    iconBox: "bg-sky-500/10 text-sky-700",
    actionBtn: "bg-sky-600 text-white hover:bg-sky-700 focus:ring-sky-400",
  },
  rest: {
    label: "Rest & Recovery",
    icon: Moon,
    border: "border-violet-200/80",
    bg: "bg-gradient-to-r from-violet-50/90 via-purple-50/50 to-indigo-50/40",
    badge: "bg-violet-100 text-violet-800 border-violet-200/60",
    iconBox: "bg-violet-500/10 text-violet-700",
    actionBtn: "bg-violet-600 text-white hover:bg-violet-700 focus:ring-violet-400",
  },
  hydrate: {
    label: "Hydration",
    icon: Droplets,
    border: "border-teal-200/80",
    bg: "bg-gradient-to-r from-teal-50/90 via-cyan-50/60 to-emerald-50/40",
    badge: "bg-teal-100 text-teal-800 border-teal-200/60",
    iconBox: "bg-teal-500/10 text-teal-700",
    actionBtn: "bg-teal-600 text-white hover:bg-teal-700 focus:ring-teal-400",
  },
  encouragement: {
    label: "Gentle Reminder",
    icon: HeartHandshake,
    border: "border-rose-200/80",
    bg: "bg-gradient-to-r from-rose-50/90 via-pink-50/50 to-teal-50/40",
    badge: "bg-rose-100 text-rose-800 border-rose-200/60",
    iconBox: "bg-rose-500/10 text-rose-700",
    actionBtn: "bg-rose-600 text-white hover:bg-rose-700 focus:ring-rose-400",
  },
  default: {
    label: "Wellness Nudge",
    icon: Sparkles,
    border: "border-teal-200/80",
    bg: "bg-gradient-to-r from-teal-50/80 via-emerald-50/50 to-white",
    badge: "bg-teal-100 text-teal-800 border-teal-200/60",
    iconBox: "bg-teal-500/10 text-teal-700",
    actionBtn: "bg-teal-600 text-white hover:bg-teal-700 focus:ring-teal-400",
  },
};

/**
 * NudgeBanner Component
 * Dismissible card with category icon, nudge text, "Not now" and "Done" actions.
 */
export function NudgeBanner({ className = "" }) {
  const dispatch = useDispatch();
  const { latestNudge, isNudgeDismissed } = useSelector((state) => state?.ai) || {};
  const [isCompleted, setIsCompleted] = useState(false);

  if (!latestNudge || isNudgeDismissed) {
    return null;
  }

  // Extract text and category
  const nudgeText =
    typeof latestNudge === "string"
      ? latestNudge
      : latestNudge.nudge || latestNudge.message || "";

  if (!nudgeText) return null;

  const categoryKey = String(latestNudge.category || "default").toLowerCase();
  const categoryConfig = NUDGE_CATEGORIES[categoryKey] || NUDGE_CATEGORIES.default;
  const CategoryIcon = categoryConfig.icon;

  const handleNotNow = () => {
    try {
      localStorage.setItem(STORAGE_DISMISSED_KEY, String(Date.now()));
    } catch {
      // ignore
    }
    dispatch(dismissNudge());
  };

  const handleDone = () => {
    setIsCompleted(true);
    try {
      localStorage.setItem(STORAGE_DISMISSED_KEY, String(Date.now()));
    } catch {
      // ignore
    }
    setTimeout(() => {
      dispatch(dismissNudge());
    }, 1800);
  };

  return (
    <aside
      aria-label="Wellness nudge"
      className={cn(
        "relative overflow-hidden rounded-2xl border p-4 transition-all duration-300 shadow-xs",
        categoryConfig.border,
        categoryConfig.bg,
        className
      )}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Left: Icon & text */}
        <div className="flex items-start gap-3 min-w-0 flex-1">
          <div
            className={cn(
              "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl",
              categoryConfig.iconBox
            )}
          >
            <CategoryIcon className="h-4.5 w-4.5" />
          </div>

          <div className="space-y-1 min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider border",
                  categoryConfig.badge
                )}
              >
                {categoryConfig.label}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
              {nudgeText}
            </p>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 self-end sm:self-center shrink-0 pt-1 sm:pt-0">
          {isCompleted ? (
            <div className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-100/90 px-3 py-1.5 text-xs font-semibold text-emerald-800 border border-emerald-200 animate-in fade-in">
              <Check className="h-3.5 w-3.5 text-emerald-600" />
              <span>Great job!</span>
            </div>
          ) : (
            <>
              <button
                type="button"
                onClick={handleNotNow}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-500 hover:text-slate-800 hover:bg-slate-100/70 rounded-xl transition cursor-pointer"
              >
                <Clock className="h-3.5 w-3.5" />
                <span>Not now</span>
              </button>

              <button
                type="button"
                onClick={handleDone}
                className={cn(
                  "inline-flex items-center gap-1 rounded-xl px-3 py-1.5 text-xs font-semibold transition cursor-pointer shadow-xs active:scale-98",
                  categoryConfig.actionBtn
                )}
              >
                <Check className="h-3.5 w-3.5" />
                <span>Done</span>
              </button>

              <button
                type="button"
                onClick={handleNotNow}
                aria-label="Close"
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 transition cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </>
          )}
        </div>
      </div>
    </aside>
  );
}

export default NudgeBanner;
