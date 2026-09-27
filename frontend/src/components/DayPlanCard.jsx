import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAIDayPlan } from "../redux/slices/aiSlice";
import {
  Sparkles,
  RefreshCw,
  Clock,
  Info,
  ChevronDown,
  ChevronUp,
  SunMedium,
  CheckCircle2,
  Calendar,
  Heart,
  Zap,
  ArrowRight,
} from "lucide-react";
import { Button } from "./ui/Button";
import { Badge } from "./ui/Badge";
import { cn } from "../lib/utils";

const ROTATING_LOADING_MESSAGES = [
  "Thinking about your day...",
  "Looking at what matters most...",
  "Matching your tasks to your current energy...",
  "Carving out breathing room for you...",
  "Bringing balance to your schedule...",
];

/**
 * Thoughtful loading skeleton with rotating messages
 */
function DayPlanSkeleton() {
  const [msgIndex, setMsgIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setMsgIndex((prev) => (prev + 1) % ROTATING_LOADING_MESSAGES.length);
    }, 1800);
    return () => clearInterval(timer);
  }, []);

  return (
    <div
      aria-live="polite"
      className="relative overflow-hidden rounded-3xl border border-teal-200/70 bg-gradient-to-br from-white via-teal-50/20 to-cyan-50/20 p-7 shadow-sm"
    >
      {/* Shimmer overlay */}
      <div className="absolute inset-0 shimmer-bg pointer-events-none opacity-40" />

      {/* Header Skeleton */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-5">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-100 text-teal-600 animate-pulse">
            <SunMedium className="h-6 w-6" />
          </div>
          <div className="space-y-2">
            <div className="h-4 w-44 rounded-md bg-slate-200 animate-pulse" />
            <div className="h-3 w-32 rounded-md bg-slate-100 animate-pulse" />
          </div>
        </div>
        <div className="h-8 w-24 rounded-xl bg-slate-100 animate-pulse" />
      </div>

      {/* Rotating Friendly Thinking Message */}
      <div className="my-6 rounded-2xl bg-white/80 p-5 border border-teal-100/80 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="relative flex h-3 w-3">
            <span className="absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75 animate-ping" />
            <span className="relative inline-flex h-3 w-3 rounded-full bg-teal-600" />
          </div>
          <p className="text-sm font-medium text-teal-900 transition-all duration-300">
            {ROTATING_LOADING_MESSAGES[msgIndex]}
          </p>
        </div>
        <div className="mt-4 space-y-2.5">
          <div className="h-3.5 w-full rounded bg-slate-200/80 animate-pulse" />
          <div className="h-3.5 w-5/6 rounded bg-slate-200/70 animate-pulse" />
          <div className="h-3.5 w-3/4 rounded bg-slate-200/60 animate-pulse" />
        </div>
      </div>

      {/* Suggested Flow Skeleton blocks */}
      <div className="space-y-3 pt-2">
        <div className="h-3.5 w-36 rounded bg-slate-200 animate-pulse" />
        <div className="grid gap-2.5">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-white/60 p-3.5"
            >
              <div className="h-7 w-7 rounded-xl bg-slate-100 animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-3.5 w-48 rounded bg-slate-200 animate-pulse" />
                <div className="h-2.5 w-32 rounded bg-slate-100 animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * DayPlanCard Component
 *
 * Displays AI Day Plan results:
 * - Reads like a message from a thoughtful friend (larger text, warm tone)
 * - Distinct card at top of dashboard
 * - Lightweight "Why this plan?" affordance (collapsed by default)
 * - Thoughtful loading state with rotating messages
 * - Structured JSON support: { summary, orderedTaskIds, notes }
 */
export function DayPlanCard({
  plan: propPlan,
  isLoading: propIsLoading,
  onRefresh: propOnRefresh,
  className = "",
}) {
  const dispatch = useDispatch();
  const reduxAI = useSelector((state) => state?.ai) || {};
  const { currentMood } = useSelector((state) => state?.mood) || {};
  const { tasks } = useSelector((state) => state?.tasks) || { tasks: [] };

  const [isWhyExpanded, setIsWhyExpanded] = useState(false);

  const activePlan = propPlan || reduxAI.dayPlan || {};
  const isLoading =
    propIsLoading !== undefined ? propIsLoading : reduxAI.loadingPlan;

  const handleRefresh = () => {
    if (propOnRefresh) {
      propOnRefresh();
    } else {
      dispatch(fetchAIDayPlan());
    }
  };

  if (isLoading) {
    return <DayPlanSkeleton />;
  }

  // Derive summary text
  const summaryText =
    activePlan.summary ||
    "Here's a gentle plan that fits how you're feeling today. Tackle your most impactful priority first, then ease into lighter administrative tasks.";

  // Derive notes or reasoning for the "Why" affordance
  const notesReasoning =
    activePlan.notes ||
    activePlan.moodAssessment ||
    (currentMood
      ? `Because you checked in feeling ${currentMood.mood} with ${
          currentMood.energyLevel || 7
        }/10 energy, this schedule paces deep focus early on and preserves recovery moments before afternoon fatigue.`
      : "This plan aligns your highest mental focus tasks with your natural peak energy windows, balancing productivity with rest.");

  // Resolve ordered tasks: supports { orderedTaskIds: [...] } or { suggestedOrder: [...] }
  let resolvedSequence = [];
  if (
    Array.isArray(activePlan.orderedTaskIds) &&
    activePlan.orderedTaskIds.length > 0
  ) {
    resolvedSequence = activePlan.orderedTaskIds
      .map((taskId, idx) => {
        const found = tasks.find((t) => t._id === taskId);
        return found
          ? {
              taskId: found._id,
              title: found.title,
              timeSlot: found.dueTime || `Step ${idx + 1}`,
              reason:
                found.aiReason ||
                "Planned for optimal focus during this portion of your day.",
            }
          : null;
      })
      .filter(Boolean);
  } else if (
    Array.isArray(activePlan.suggestedOrder) &&
    activePlan.suggestedOrder.length > 0
  ) {
    resolvedSequence = activePlan.suggestedOrder;
  }

  return (
    <div
      role="region"
      aria-label="Today's AI Day Plan"
      className={cn(
        "relative rounded-3xl border border-slate-200/90 bg-gradient-to-b from-white via-slate-50/30 to-teal-50/15 p-6 sm:p-7 shadow-sm transition-all duration-300 hover:border-slate-300",
        className
      )}
    >
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-5">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-teal-500 via-teal-600 to-cyan-500 text-white shadow-xs">
            <SunMedium className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-slate-800 flex items-center gap-2">
              Today's Gentle Plan
              <span className="inline-flex items-center rounded-full bg-teal-50 px-2.5 py-0.5 text-[11px] font-semibold text-teal-800 border border-teal-200/60">
                Paced for you
              </span>
            </h2>
            <p className="text-xs text-slate-500">
              Thoughtfully arranged around your mental headspace & energy
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {currentMood && (
            <Badge
              variant="default"
              className="capitalize text-xs font-semibold py-1 px-3 bg-teal-50 text-teal-800 border-teal-200"
            >
              Rhythm: {currentMood.mood}
            </Badge>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            isLoading={isLoading}
            className="h-8 gap-1.5 text-xs text-slate-500 hover:text-teal-700 hover:bg-teal-50/80 cursor-pointer"
            title="Recalculate plan with latest mood"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Refresh plan</span>
          </Button>
        </div>
      </div>

      {/* Main Day Plan Summary (Thoughtful Friend Voice & Larger Text) */}
      <div className="py-5">
        <div className="relative rounded-2xl bg-white/90 p-5 sm:p-6 border border-teal-100/80 shadow-2xs">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-teal-700">
                <Sparkles className="h-3.5 w-3.5 text-teal-600" />
                A thought for your day
              </span>
              <p className="text-base sm:text-lg font-medium text-slate-800 leading-relaxed">
                "{summaryText}"
              </p>
            </div>

            {/* Lightweight "Why?" Affordance */}
            <button
              type="button"
              onClick={() => setIsWhyExpanded((prev) => !prev)}
              aria-expanded={isWhyExpanded}
              aria-label="Why this plan?"
              className={cn(
                "inline-flex items-center gap-1 rounded-xl px-2.5 py-1.5 text-xs font-medium transition cursor-pointer select-none shrink-0",
                isWhyExpanded
                  ? "bg-teal-100 text-teal-800"
                  : "bg-slate-100/80 text-slate-600 hover:bg-teal-50 hover:text-teal-700"
              )}
            >
              <Info className="h-3.5 w-3.5 text-teal-600" />
              <span>why?</span>
              {isWhyExpanded ? (
                <ChevronUp className="h-3 w-3" />
              ) : (
                <ChevronDown className="h-3 w-3" />
              )}
            </button>
          </div>

          {/* Expandable "Why" Reasoning Notes */}
          {isWhyExpanded && (
            <div className="mt-4 rounded-xl border border-teal-200/70 bg-gradient-to-r from-teal-50/80 to-cyan-50/60 p-4 text-xs text-slate-700 animate-in fade-in slide-in-from-top-1 duration-200">
              <div className="flex items-start gap-2.5">
                <Sparkles className="h-4 w-4 text-teal-600 mt-0.5 shrink-0" />
                <div className="space-y-1.5">
                  <h4 className="font-bold text-teal-900 text-xs">
                    Behind this plan:
                  </h4>
                  <p className="text-slate-600 leading-relaxed">
                    {notesReasoning}
                  </p>
                  {activePlan.wellnessTip && (
                    <p className="pt-1 text-[11px] font-medium text-teal-800">
                      🌿 Thoughtful note: {activePlan.wellnessTip}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Suggested Chronological Flow / Ordered Tasks */}
      <div className="space-y-3 pt-1">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-slate-400" />
            Suggested Sequence for Today
          </h4>
          <span className="text-[11px] text-slate-400 font-medium">
            Take one at a time
          </span>
        </div>

        {resolvedSequence.length > 0 ? (
          <div className="space-y-2.5">
            {resolvedSequence.map((stepItem, idx) => (
              <div
                key={stepItem.taskId || idx}
                className="group relative flex items-start gap-3.5 rounded-2xl border border-slate-200/70 bg-white/80 p-3.5 transition-all duration-200 hover:border-teal-200 hover:bg-white hover:shadow-xs"
              >
                {/* Step indicator */}
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-teal-50 font-bold text-xs text-teal-700 border border-teal-200/60">
                  {idx + 1}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center justify-between gap-1">
                    <h5 className="text-xs font-bold text-slate-800 truncate">
                      {stepItem.title}
                    </h5>
                    {stepItem.timeSlot && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                        <Clock className="h-2.5 w-2.5" />
                        {stepItem.timeSlot}
                      </span>
                    )}
                  </div>

                  {stepItem.reason && (
                    <p className="mt-1 text-[11px] text-slate-500 leading-snug">
                      {stepItem.reason}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-200 p-6 text-center text-xs text-slate-500">
            No specific sequence yet today. Check in with your mood or add a task to build your personalized rhythm.
          </div>
        )}
      </div>
    </div>
  );
}

export default DayPlanCard;
