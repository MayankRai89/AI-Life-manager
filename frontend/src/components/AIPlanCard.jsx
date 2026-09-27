import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAIDayPlan } from "../redux/slices/aiSlice";
import { Button } from "./ui/Button";
import { Badge } from "./ui/Badge";
import {
  Sparkles,
  RefreshCw,
  Clock,
  Compass,
  Zap,
  CheckCircle2,
  Calendar,
} from "lucide-react";

export function AIPlanCard() {
  const dispatch = useDispatch();
  const { dayPlan, loadingPlan } = useSelector((state) => state.ai);
  const { currentMood } = useSelector((state) => state.mood);

  const handleRefresh = () => {
    dispatch(fetchAIDayPlan());
  };

  const plan = dayPlan || {};

  return (
    <div className="rounded-3xl border border-slate-200/80 bg-white/90 p-6 shadow-sm backdrop-blur-sm transition-all hover:border-slate-300">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-teal-500 to-cyan-500 text-white shadow-xs">
            <Compass className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
              Today's AI Day Plan
              <span className="inline-flex items-center rounded-full bg-teal-50 px-2 py-0.5 text-[10px] font-semibold text-teal-700 border border-teal-200">
                AI Powered
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Personalized flow tuned to your mental headspace
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {currentMood && (
            <Badge variant="ai" className="capitalize text-[11px] py-1">
              Mood: {currentMood.mood}
            </Badge>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            isLoading={loadingPlan}
            className="h-8 gap-1.5 text-xs text-slate-500 hover:text-teal-700"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Recalculate</span>
          </Button>
        </div>
      </div>

      {/* Plan Summary Section */}
      <div className="py-4">
        <div className="rounded-2xl bg-gradient-to-br from-slate-50 via-teal-50/20 to-white p-4 border border-slate-100">
          <div className="flex items-start gap-2.5">
            <Sparkles className="h-4 w-4 shrink-0 text-teal-600 mt-0.5" />
            <div className="space-y-1">
              <p className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Summary & Flow Assessment
              </p>
              <p className="text-xs text-slate-600 leading-relaxed">
                {plan.summary ||
                  "Your schedule is balanced. Tackle your top strategic task before moving on to administrative tasks."}
              </p>
            </div>
          </div>

          {plan.wellnessTip && (
            <div className="mt-3 pt-3 border-t border-slate-200/50 flex items-center gap-2 text-xs text-teal-800 font-medium">
              <span className="h-1.5 w-1.5 rounded-full bg-teal-500" />
              <span>Pro-tip: {plan.wellnessTip}</span>
            </div>
          )}
        </div>
      </div>

      {/* Suggested Task Order */}
      <div className="space-y-3 pt-1">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5 text-slate-400" />
          Suggested Task Sequence
        </h4>

        {plan.suggestedOrder && plan.suggestedOrder.length > 0 ? (
          <div className="space-y-2.5">
            {plan.suggestedOrder.map((stepItem, idx) => (
              <div
                key={stepItem.taskId || idx}
                className="group relative flex items-start gap-3 rounded-2xl border border-slate-100 bg-white/70 p-3.5 transition-all duration-200 hover:border-teal-200 hover:bg-white hover:shadow-xs"
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
          <div className="rounded-2xl border border-dashed border-slate-200 p-6 text-center text-xs text-slate-400">
            No specific sequence order generated yet. Log a mood check-in to generate today's order.
          </div>
        )}
      </div>
    </div>
  );
}

export default AIPlanCard;
