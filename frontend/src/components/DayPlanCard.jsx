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
  Footprints,
  Wind,
  Coffee,
  Check,
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
 * Strips raw markdown syntax characters (*, **, ###, etc.)
 */
function cleanText(str) {
  if (!str) return "";
  return str
    .replace(/^["']|["']$/g, "")
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/\*(.*?)\*/g, "$1")
    .replace(/^###\s*/gm, "")
    .replace(/^[*-]\s*/gm, "")
    .trim();
}

/**
 * Parses raw AI markdown text or structured JSON into a clean, human-readable plan.
 * Handles unstructured dumps like:
 * "Hello Mayank! ... ### 1. Top 3 Focus Tasks ... ### 2. Wellness Activities ... ### 3. Motivational Insight ..."
 */
export function parseDayPlan(rawPlan, tasks = []) {
  if (!rawPlan) {
    return {
      summary: "Here is a gentle plan tailored to your energy today.",
      focusTasks: [],
      wellnessActivities: [],
      notes: null,
      forwardLooking: null,
    };
  }

  // If already structured with focusTasks/wellnessActivities
  if (
    rawPlan.focusTasks &&
    Array.isArray(rawPlan.focusTasks) &&
    rawPlan.focusTasks.length > 0
  ) {
    return {
      summary: cleanText(rawPlan.summary),
      focusTasks: rawPlan.focusTasks,
      wellnessActivities: rawPlan.wellnessActivities || [],
      notes: cleanText(rawPlan.notes),
      forwardLooking: null,
    };
  }

  const textToParse =
    typeof rawPlan === "string"
      ? rawPlan
      : rawPlan.summary || rawPlan.suggestion || "";

  // Check if text has sections like "### 1.", "Top 3 Focus Tasks", "Wellness Activities"
  const hasMarkdownSections =
    textToParse.includes("### 1.") ||
    textToParse.includes("Top 3 Focus Tasks") ||
    textToParse.includes("Wellness Activities") ||
    textToParse.includes("Motivational Insight");

  if (!hasMarkdownSections) {
    // Standard structured or short text
    let resolvedTasks = [];
    if (Array.isArray(rawPlan.orderedTaskIds) && rawPlan.orderedTaskIds.length > 0) {
      resolvedTasks = rawPlan.orderedTaskIds
        .map((taskId, idx) => {
          const found = tasks.find((t) => t._id === taskId);
          return found
            ? {
                title: found.title,
                action: found.description || "",
                reason: found.aiReason || "Fits your current headspace.",
                timeSlot: found.dueTime || `Step ${idx + 1}`,
              }
            : null;
        })
        .filter(Boolean);
    } else if (Array.isArray(rawPlan.suggestedOrder) && rawPlan.suggestedOrder.length > 0) {
      resolvedTasks = rawPlan.suggestedOrder.map((item, idx) => ({
        title: item.title,
        action: item.description || "",
        reason: item.reason || "",
        timeSlot: item.timeSlot || `Step ${idx + 1}`,
      }));
    }

    return {
      summary: cleanText(textToParse),
      focusTasks: resolvedTasks,
      wellnessActivities: rawPlan.wellnessActivities || [],
      notes: cleanText(rawPlan.notes || rawPlan.moodAssessment),
      forwardLooking: null,
    };
  }

  // 1. Extract Summary (everything before the tasks header)
  const taskHeaderMatch = textToParse.match(
    /(?:###\s*\d*\.?\s*)?(?:Top\s*\d*\s*Focus Tasks[^\n]*)/i
  );
  let summary = "";
  let tasksBlock = "";
  let wellnessBlock = "";
  let notesBlock = "";

  if (taskHeaderMatch) {
    summary = textToParse.substring(0, taskHeaderMatch.index).trim();
    // remove boilerplate intro lines like "Here is your plan for the day:"
    summary = summary
      .replace(/Here is your (?:optimized )?plan for the day:?/i, "")
      .trim();
  } else {
    summary = textToParse;
  }

  // 2. Extract Tasks Section & Wellness Section
  const wellnessHeaderMatch = textToParse.match(
    /(?:###\s*\d*\.?\s*)?(?:Wellness Activities[^\n]*)/i
  );
  const motivationalHeaderMatch = textToParse.match(
    /(?:###\s*\d*\.?\s*)?(?:Motivational Insight[^\n]*)/i
  );

  if (taskHeaderMatch && wellnessHeaderMatch) {
    tasksBlock = textToParse.substring(
      taskHeaderMatch.index + taskHeaderMatch[0].length,
      wellnessHeaderMatch.index
    ).trim();
  }

  if (wellnessHeaderMatch) {
    const endWellness = motivationalHeaderMatch
      ? motivationalHeaderMatch.index
      : textToParse.length;
    wellnessBlock = textToParse.substring(
      wellnessHeaderMatch.index + wellnessHeaderMatch[0].length,
      endWellness
    ).trim();
  }

  if (motivationalHeaderMatch) {
    notesBlock = textToParse.substring(
      motivationalHeaderMatch.index + motivationalHeaderMatch[0].length
    ).trim();
  }

  // Parse Focus Tasks from block
  const focusTasks = [];
  // Pattern: * **Task 1: Title:** Action. *Why:* Reason.
  const taskRegex =
    /(?:\*|\d+\.)\s*\*\*Task\s*\d*:\s*([^*]+)\*\*:?\s*([^*]+?)(?:\*Why:\*|\*Why\*:?|Why:?)\s*([^\n*]+)/gi;
  let match;
  while ((match = taskRegex.exec(tasksBlock)) !== null) {
    focusTasks.push({
      title: cleanText(match[1]),
      action: cleanText(match[2]),
      reason: cleanText(match[3]),
      timeSlot: `Focus Step ${focusTasks.length + 1}`,
    });
  }

  // Fallback task pattern: * **Item:** ...
  if (focusTasks.length === 0 && tasksBlock) {
    const fallbackRegex = /(?:\*|\d+\.)\s*\*\*([^*]+)\*\*:?\s*([^\n*]+)/gi;
    let fb;
    while ((fb = fallbackRegex.exec(tasksBlock)) !== null) {
      const parts = fb[2].split(/\*?Why:?\*?/i);
      focusTasks.push({
        title: cleanText(fb[1]).replace(/^Task\s*\d*:\s*/i, ""),
        action: cleanText(parts[0]),
        reason: parts[1] ? cleanText(parts[1]) : "Aligned with current energy.",
        timeSlot: `Focus Step ${focusTasks.length + 1}`,
      });
    }
  }

  // Parse Wellness Activities from block
  const wellnessActivities = [];
  const wellnessRegex = /(?:\*|\d+\.)\s*\*\*([^*]+)\*\*:?\s*([^\n*]+)/gi;
  let wMatch;
  while ((wMatch = wellnessRegex.exec(wellnessBlock)) !== null) {
    const title = cleanText(wMatch[1]);
    const desc = cleanText(wMatch[2]);
    let type = "rest";
    if (/walk|movement|stretch|exercise/i.test(title + desc)) type = "move";
    if (/water|hydrate|drink/i.test(title + desc)) type = "hydrate";
    if (/breathe|meditation|calm/i.test(title + desc)) type = "rest";

    wellnessActivities.push({
      title,
      description: desc,
      type,
    });
  }

  // Separate motivational insight and forward-looking statement if present
  let forwardLooking = null;
  let generalNotes = notesBlock;
  const forwardMatch = notesBlock.match(
    /\*\*Forward-looking statement:\*\*\s*([^\n]+(?:\n[^\n]+)?)/i
  );
  if (forwardMatch) {
    forwardLooking = cleanText(forwardMatch[1]);
    generalNotes = notesBlock.substring(0, forwardMatch.index).trim();
  }

  return {
    summary: cleanText(summary),
    focusTasks,
    wellnessActivities,
    notes: cleanText(generalNotes),
    forwardLooking,
  };
}

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
 * Displays AI Day Plan results in a human-friendly format:
 * - Friendly summary message from a thoughtful friend
 * - Clean structured task focus sequence
 * - Mindful wellness activity moments
 * - Expandable "Why this plan?" drawer showing cognitive insights & forward-looking notes
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

  // Parse content into clean, structured human-readable sections
  const parsed = parseDayPlan(activePlan, tasks);

  return (
    <div
      role="region"
      aria-label="Today's AI Day Plan"
      className={cn(
        "relative rounded-3xl border border-slate-200/90 bg-gradient-to-b from-white via-slate-50/30 to-teal-50/15 p-6 sm:p-7 shadow-sm transition-all duration-300 hover:border-slate-300",
        className
      )}
    >
      {/* Card Header */}
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
        <div className="relative rounded-2xl bg-white/95 p-5 sm:p-6 border border-teal-100/90 shadow-2xs">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2.5 min-w-0">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-teal-700">
                <Sparkles className="h-3.5 w-3.5 text-teal-600" />
                A thought for your day
              </span>
              <p className="text-base sm:text-lg font-medium text-slate-800 leading-relaxed break-words">
                {parsed.summary}
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
                  ? "bg-teal-100 text-teal-800 shadow-2xs"
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

          {/* Expandable "Why" Reasoning & Motivational Insight Drawer */}
          {isWhyExpanded && (
            <div className="mt-4 rounded-xl border border-teal-200/80 bg-gradient-to-br from-teal-50/90 via-cyan-50/60 to-white p-4.5 text-xs text-slate-700 animate-in fade-in slide-in-from-top-1 duration-200">
              <div className="flex items-start gap-3">
                <Sparkles className="h-4 w-4 text-teal-600 mt-0.5 shrink-0" />
                <div className="space-y-2.5 min-w-0 flex-1">
                  <h4 className="font-bold text-teal-950 text-xs flex items-center gap-1.5">
                    <span>Why this schedule works for you:</span>
                  </h4>

                  {parsed.notes && (
                    <p className="text-slate-600 leading-relaxed">
                      {parsed.notes}
                    </p>
                  )}

                  {parsed.forwardLooking && (
                    <div className="rounded-lg bg-teal-100/60 p-2.5 border border-teal-200/60 text-teal-900 leading-relaxed font-medium">
                      <span className="font-bold block text-[11px] uppercase tracking-wider text-teal-800 mb-0.5">
                        Looking ahead:
                      </span>
                      {parsed.forwardLooking}
                    </div>
                  )}

                  {activePlan.wellnessTip && (
                    <p className="pt-0.5 text-[11px] font-medium text-teal-800 flex items-center gap-1.5">
                      <span>🌿 Pro-tip:</span>
                      <span>{activePlan.wellnessTip}</span>
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Suggested Focus Tasks Sequence */}
      <div className="space-y-3 pt-1">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-slate-400" />
            Top Focus Tasks for Today
          </h4>
          <span className="text-[11px] text-slate-400 font-medium">
            Take one at a time
          </span>
        </div>

        {parsed.focusTasks && parsed.focusTasks.length > 0 ? (
          <div className="space-y-2.5">
            {parsed.focusTasks.map((taskItem, idx) => (
              <div
                key={taskItem.title + idx}
                className="group relative flex items-start gap-3.5 rounded-2xl border border-slate-200/80 bg-white/90 p-4 transition-all duration-200 hover:border-teal-200 hover:bg-white hover:shadow-xs"
              >
                {/* Step indicator */}
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-teal-50 font-bold text-xs text-teal-700 border border-teal-200/60">
                  {idx + 1}
                </div>

                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex flex-wrap items-center justify-between gap-1">
                    <h5 className="text-sm font-bold text-slate-800 break-words">
                      {taskItem.title}
                    </h5>
                    {taskItem.timeSlot && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                        <Clock className="h-2.5 w-2.5 text-slate-400" />
                        {taskItem.timeSlot}
                      </span>
                    )}
                  </div>

                  {taskItem.action && (
                    <p className="text-xs text-slate-600 leading-relaxed font-normal">
                      {taskItem.action}
                    </p>
                  )}

                  {taskItem.reason && (
                    <div className="pt-1 flex items-center gap-1.5 text-[11px] text-teal-800/90 font-medium">
                      <Sparkles className="h-3 w-3 text-teal-600 shrink-0" />
                      <span>{taskItem.reason}</span>
                    </div>
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

      {/* Wellness Activities Section (if available) */}
      {parsed.wellnessActivities && parsed.wellnessActivities.length > 0 && (
        <div className="mt-6 pt-5 border-t border-slate-100 space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-teal-800 flex items-center gap-1.5">
            <Heart className="h-3.5 w-3.5 text-teal-600" />
            Mindful Wellness Moments
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {parsed.wellnessActivities.map((act, idx) => {
              const isMove = act.type === "move";
              const ActivityIcon = isMove ? Footprints : Wind;
              return (
                <div
                  key={idx}
                  className="rounded-2xl border border-teal-100 bg-gradient-to-br from-teal-50/60 to-white p-3.5 flex items-start gap-3"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-teal-100 text-teal-700">
                    <ActivityIcon className="h-4 w-4" />
                  </div>
                  <div className="space-y-0.5 min-w-0">
                    <h6 className="text-xs font-bold text-slate-800">
                      {act.title}
                    </h6>
                    <p className="text-[11px] text-slate-600 leading-snug">
                      {act.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default DayPlanCard;
