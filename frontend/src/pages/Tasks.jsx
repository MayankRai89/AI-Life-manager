import React from "react";
import TaskList from "../components/TaskList";
import { useSelector } from "react-redux";
import { CheckSquare, ListFilter, Sparkles, CheckCircle2, Clock } from "lucide-react";

export function Tasks() {
  const { tasks } = useSelector((state) => state.tasks);

  const pending = tasks.filter((t) => t.status !== "completed");
  const completed = tasks.filter((t) => t.status === "completed");
  const urgentCount = tasks.filter((t) => t.priority === "urgent" && t.status !== "completed").length;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      {/* Page Title & Overview */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200/80 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700 border border-teal-200/50 mb-1.5">
            <CheckSquare className="h-3.5 w-3.5 text-teal-600" />
            <span>Task Management</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800">
            All Action Items
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Organize, prioritize, and check off your daily responsibilities at a mindful pace.
          </p>
        </div>

        {/* Status Metrics */}
        <div className="flex items-center gap-3">
          <div className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 shadow-xs text-center">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">
              Pending
            </span>
            <span className="text-lg font-extrabold text-slate-800">
              {pending.length}
            </span>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 shadow-xs text-center">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">
              Completed
            </span>
            <span className="text-lg font-extrabold text-teal-700">
              {completed.length}
            </span>
          </div>
          {urgentCount > 0 && (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-2.5 shadow-xs text-center">
              <span className="text-[10px] uppercase font-bold text-rose-500 block">
                Urgent
              </span>
              <span className="text-lg font-extrabold text-rose-600">
                {urgentCount}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Task List Component */}
      <div className="rounded-3xl border border-slate-200/80 bg-white/80 p-6 shadow-sm backdrop-blur-sm">
        <TaskList showHeader={true} />
      </div>
    </div>
  );
}

export default Tasks;
