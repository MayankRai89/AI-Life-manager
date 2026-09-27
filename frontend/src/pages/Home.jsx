import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import MoodCheckin from "../components/MoodCheckin";
import TaskList from "../components/TaskList";
import AIPlanCard from "../components/AIPlanCard";
import NudgeBanner from "../components/NudgeBanner";
import { fetchTasks } from "../redux/slices/taskSlice";
import { fetchTodayMood } from "../redux/slices/moodSlice";
import { fetchAIDayPlan } from "../redux/slices/aiSlice";
import { ArrowRight, CheckCircle, Clock, Zap, Sparkles } from "lucide-react";

export function Home() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { tasks } = useSelector((state) => state.tasks);
  const { currentMood } = useSelector((state) => state.mood);

  useEffect(() => {
    // Initial fetch from backend if available
    dispatch(fetchTasks());
    dispatch(fetchTodayMood());
    dispatch(fetchAIDayPlan());
  }, [dispatch]);

  const pendingCount = tasks.filter((t) => t.status !== "completed").length;
  const completedCount = tasks.filter((t) => t.status === "completed").length;

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Nudge Banner */}
      <NudgeBanner />

      {/* Greeting & Quick Stats Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-800">
            {getGreeting()},{" "}
            <span className="bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
              {user?.name || "Friend"}
            </span>
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Welcome to your calm command center. Let's pace your day smoothly.
          </p>
        </div>

        {/* Quick status pills */}
        <div className="flex items-center gap-3">
          <div className="rounded-2xl border border-slate-200/80 bg-white px-4 py-2 shadow-xs">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
              Active Tasks
            </span>
            <span className="text-base font-extrabold text-slate-800">
              {pendingCount} remaining
            </span>
          </div>

          <div className="rounded-2xl border border-teal-200/70 bg-teal-50/50 px-4 py-2 shadow-xs">
            <span className="text-[10px] uppercase font-bold tracking-wider text-teal-700 block">
              Today's Rhythm
            </span>
            <span className="text-base font-extrabold text-teal-800 capitalize">
              {currentMood?.mood || "Calm"}
            </span>
          </div>
        </div>
      </div>

      {/* Primary Mood Check-in Widget */}
      <section aria-label="Mood Check-in">
        <MoodCheckin />
      </section>

      {/* Dashboard Grid: AI Day Plan + Priority Task List */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: AI Day Plan Card (7 cols on large screens) */}
        <div className="lg:col-span-7 space-y-6">
          <AIPlanCard />
        </div>

        {/* Right Column: High Priority Action Items (5 cols on large screens) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-800">Action Queue</h3>
            <Link
              to="/tasks"
              className="inline-flex items-center gap-1 text-xs font-semibold text-teal-600 hover:text-teal-700 transition"
            >
              <span>Full Task List</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <TaskList showHeader={false} maxItems={4} />

          {tasks.length > 4 && (
            <div className="pt-2 text-center">
              <Link
                to="/tasks"
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition shadow-xs"
              >
                <span>View all {tasks.length} tasks</span>
                <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Home;
