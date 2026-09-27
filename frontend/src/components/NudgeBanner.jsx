import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { dismissNudge, restoreNudge } from "../redux/slices/aiSlice";
import { HeartHandshake, X, Sparkles, Droplets, RotateCcw } from "lucide-react";

export function NudgeBanner() {
  const dispatch = useDispatch();
  const { latestNudge, isNudgeDismissed } = useSelector((state) => state.ai);

  if (!latestNudge) return null;

  if (isNudgeDismissed) {
    return (
      <div className="flex justify-end pb-2">
        <button
          onClick={() => dispatch(restoreNudge())}
          className="inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-400 hover:text-teal-600 transition cursor-pointer"
        >
          <RotateCcw className="h-3 w-3" />
          <span>Show wellness nudge</span>
        </button>
      </div>
    );
  }

  return (
    <div className="relative mb-6 overflow-hidden rounded-2xl border border-teal-200/80 bg-gradient-to-r from-teal-50 via-cyan-50/60 to-emerald-50/50 p-4 shadow-xs transition-all duration-300">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-600/10 text-teal-700">
            <HeartHandshake className="h-5 w-5 text-teal-600" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700 bg-teal-100/80 px-2 py-0.5 rounded-full">
                Wellness Nudge
              </span>
              <span className="text-xs font-semibold text-slate-700">
                {latestNudge.title}
              </span>
            </div>
            <p className="mt-0.5 text-xs text-slate-600 leading-relaxed">
              {latestNudge.message}
            </p>
          </div>
        </div>

        <button
          onClick={() => dispatch(dismissNudge())}
          aria-label="Dismiss wellness nudge"
          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200/50 hover:text-slate-600 transition cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

export default NudgeBanner;
