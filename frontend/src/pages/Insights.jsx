import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchMoodInsights } from "../redux/slices/moodSlice";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import {
  TrendingUp,
  Heart,
  Zap,
  Flame,
  Info,
  Calendar,
  Layers,
  Smile,
  ArrowRight,
  Sparkles,
  BarChart3,
} from "lucide-react";
import { Button } from "../components/ui/Button";

function formatDateLabel(dateStr) {
  if (!dateStr) return "";
  try {
    const parts = dateStr.split("-");
    if (parts.length === 3) {
      const d = new Date(parts[0], parts[1] - 1, parts[2]);
      return d.toLocaleDateString("en-US", { weekday: "short", day: "numeric" });
    }
    return dateStr;
  } catch {
    return dateStr;
  }
}

export function Insights() {
  const dispatch = useDispatch();
  const { insights, loadingInsights } = useSelector((state) => state.mood);
  const [daysPeriod, setDaysPeriod] = useState(7);

  useEffect(() => {
    dispatch(fetchMoodInsights(daysPeriod));
  }, [dispatch, daysPeriod]);

  const daily = insights?.daily || [];
  const completionByCapacity = insights?.completionByCapacity || [];
  const completionByMood = insights?.completionByMood || [];

  // Plain-language takeaway generated with deterministic rules in code (no AI call)
  const generateTakeaway = () => {
    if (daily.length < 5) {
      return "Log your mood for at least 5 days to uncover reliable relationships between your mental headspace and productivity.";
    }

    if (completionByCapacity.length > 0) {
      const sortedByTasks = [...completionByCapacity].sort(
        (a, b) => b.avgTasksCompleted - a.avgTasksCompleted
      );
      const topCap = sortedByTasks[0];
      if (topCap && topCap.avgTasksCompleted > 0) {
        return `You completed the most tasks on days with ${topCap.capacityLevel} capacity (averaging ${topCap.avgTasksCompleted} tasks/day across ${topCap.daysCounted} ${topCap.daysCounted === 1 ? "day" : "days"}).`;
      }
    }

    if (completionByMood.length > 0) {
      const sortedMood = [...completionByMood].sort(
        (a, b) => b.avgTasksCompleted - a.avgTasksCompleted
      );
      const topMood = sortedMood[0];
      if (topMood && topMood.avgTasksCompleted > 0) {
        return `Your task momentum was highest on days you checked in feeling ${topMood.mood} (averaging ${topMood.avgTasksCompleted} tasks/day).`;
      }
    }

    // Default takeaway based on energy vs stress
    const avgEnergy =
      daily.reduce((sum, d) => sum + (d.avgEnergy || 0), 0) / daily.length;
    const avgStress =
      daily.reduce((sum, d) => sum + (d.avgStress || 0), 0) / daily.length;

    if (avgEnergy >= 7 && avgStress <= 4) {
      return "Your overall energy remained high while stress was low, supporting steady sustainable focus.";
    } else if (avgStress >= 6) {
      return "Stress levels have been elevated this week. Consider building more intentional breathing room into your schedule.";
    }

    return "Your daily rhythm is stabilizing. Consistent check-ins help pace your workflow smoothly.";
  };

  const chartData = daily.map((d) => ({
    ...d,
    displayDate: formatDateLabel(d.date),
  }));

  const capacityData = completionByCapacity.map((c) => ({
    name: c.capacityLevel.charAt(0).toUpperCase() + c.capacityLevel.slice(1),
    avgTasks: c.avgTasksCompleted,
    days: c.daysCounted,
  }));

  const moodData = completionByMood.slice(0, 5).map((m) => ({
    name: m.mood.charAt(0).toUpperCase() + m.mood.slice(1),
    avgTasks: m.avgTasksCompleted,
    days: m.daysCounted,
  }));

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700 border border-teal-200/50 mb-1.5">
            <TrendingUp className="h-3.5 w-3.5 text-teal-600" />
            <span>Wellness Analytics</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800">
            Insights & Trends
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Observe the interplay between your mental capacity, energy, and completed action items.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setDaysPeriod(7)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
              daysPeriod === 7
                ? "bg-teal-600 text-white shadow-xs"
                : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            7 Days
          </button>
          <button
            type="button"
            onClick={() => setDaysPeriod(14)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
              daysPeriod === 14
                ? "bg-teal-600 text-white shadow-xs"
                : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            14 Days
          </button>
          <button
            type="button"
            onClick={() => setDaysPeriod(30)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
              daysPeriod === 30
                ? "bg-teal-600 text-white shadow-xs"
                : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            30 Days
          </button>
        </div>
      </div>

      {/* Empty State when no data is available */}
      {daily.length === 0 && !loadingInsights ? (
        <div className="rounded-3xl border border-dashed border-slate-200 bg-white/70 p-12 text-center flex flex-col items-center justify-center space-y-4 shadow-sm">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-50 text-teal-600 border border-teal-100">
            <BarChart3 className="h-7 w-7" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-800">
              No wellness data logged yet
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Complete your first mood check-in to begin tracking your energy, stress levels, and task completion rhythm over time.
            </p>
          </div>
          <Link to="/dashboard">
            <Button className="gap-2 text-xs">
              <span>Log Today's Mood</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
      ) : (
        <>
          {/* Plain-Language Takeaway Banner */}
          <div className="rounded-3xl border border-teal-200/80 bg-gradient-to-r from-teal-50/90 via-cyan-50/50 to-white p-5 sm:p-6 shadow-sm flex items-start gap-3.5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-teal-600 text-white shadow-xs">
              <Sparkles className="h-5 w-5" />
            </div>
            <div className="space-y-0.5 min-w-0">
              <h4 className="text-xs font-bold uppercase tracking-wider text-teal-800">
                Pattern Takeaway
              </h4>
              <p className="text-xs sm:text-sm text-slate-700 font-medium leading-relaxed">
                {generateTakeaway()}
              </p>
            </div>
          </div>

          {/* Low Data Warning (< 5 days) */}
          {daily.length > 0 && daily.length < 5 && (
            <div className="rounded-2xl border border-amber-200 bg-amber-50/80 p-4 flex items-center gap-3 text-xs text-amber-900">
              <Info className="h-4 w-4 shrink-0 text-amber-600" />
              <span>
                <strong>Note:</strong> Insights get more accurate as you check in more days. You currently have {daily.length} {daily.length === 1 ? "day" : "days"} logged.
              </span>
            </div>
          )}

          {/* 7-Day Line Chart: Mood, Energy, Stress */}
          <div className="rounded-3xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-teal-600" />
                  Daily Mood, Energy & Stress Trajectory
                </h3>
                <p className="text-xs text-slate-500">
                  Scores rated on a scale of 1 to 10
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs font-semibold">
                <span className="flex items-center gap-1.5 text-teal-700">
                  <span className="h-2.5 w-2.5 rounded-full bg-teal-600" />
                  Mood Score
                </span>
                <span className="flex items-center gap-1.5 text-amber-600">
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                  Energy Level
                </span>
                <span className="flex items-center gap-1.5 text-rose-600">
                  <span className="h-2.5 w-2.5 rounded-full bg-rose-500" />
                  Stress Level
                </span>
              </div>
            </div>

            <div className="h-64 sm:h-72 lg:h-80 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis
                    dataKey="displayDate"
                    tick={{ fontSize: 11, fill: "#64748b" }}
                    axisLine={{ stroke: "#e2e8f0" }}
                    tickLine={false}
                  />
                  <YAxis
                    domain={[0, 10]}
                    tick={{ fontSize: 11, fill: "#64748b" }}
                    axisLine={{ stroke: "#e2e8f0" }}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      color: "#fff",
                      borderRadius: "12px",
                      border: "none",
                      fontSize: "12px",
                      padding: "8px 12px",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="avgMood"
                    name="Mood"
                    stroke="#0d9488"
                    strokeWidth={2.5}
                    dot={{ r: 3, fill: "#0d9488" }}
                    activeDot={{ r: 5 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="avgEnergy"
                    name="Energy"
                    stroke="#f59e0b"
                    strokeWidth={2.5}
                    dot={{ r: 3, fill: "#f59e0b" }}
                    activeDot={{ r: 5 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="avgStress"
                    name="Stress"
                    stroke="#f43f5e"
                    strokeWidth={2.5}
                    dot={{ r: 3, fill: "#f43f5e" }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Two Simple Bar Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Bar Chart 1: Tasks by Capacity */}
            <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <Layers className="h-4 w-4 text-teal-600" />
                  Task Completion by Capacity Level
                </h3>
                <p className="text-xs text-slate-500">
                  Average tasks completed per day by check-in capacity
                </p>
              </div>

              {capacityData.length === 0 ? (
                <div className="h-48 flex items-center justify-center text-xs text-slate-400">
                  No capacity data logged yet in this timeframe
                </div>
              ) : (
                <div className="h-48 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={capacityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                      <XAxis
                        dataKey="name"
                        tick={{ fontSize: 11, fill: "#64748b" }}
                        axisLine={{ stroke: "#e2e8f0" }}
                        tickLine={false}
                      />
                      <YAxis
                        tick={{ fontSize: 11, fill: "#64748b" }}
                        axisLine={{ stroke: "#e2e8f0" }}
                        tickLine={false}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#0f172a",
                          color: "#fff",
                          borderRadius: "12px",
                          border: "none",
                          fontSize: "12px",
                        }}
                      />
                      <Bar
                        dataKey="avgTasks"
                        name="Avg Tasks/Day"
                        fill="#0d9488"
                        radius={[6, 6, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            {/* Bar Chart 2: Tasks by Mood */}
            <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <Smile className="h-4 w-4 text-cyan-600" />
                  Task Completion by Mood State
                </h3>
                <p className="text-xs text-slate-500">
                  Average tasks completed per day grouped by mood label
                </p>
              </div>

              {moodData.length === 0 ? (
                <div className="h-48 flex items-center justify-center text-xs text-slate-400">
                  No mood completion data logged yet in this timeframe
                </div>
              ) : (
                <div className="h-48 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={moodData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                      <XAxis
                        dataKey="name"
                        tick={{ fontSize: 11, fill: "#64748b" }}
                        axisLine={{ stroke: "#e2e8f0" }}
                        tickLine={false}
                      />
                      <YAxis
                        tick={{ fontSize: 11, fill: "#64748b" }}
                        axisLine={{ stroke: "#e2e8f0" }}
                        tickLine={false}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#0f172a",
                          color: "#fff",
                          borderRadius: "12px",
                          border: "none",
                          fontSize: "12px",
                        }}
                      />
                      <Bar
                        dataKey="avgTasks"
                        name="Avg Tasks/Day"
                        fill="#0284c7"
                        radius={[6, 6, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default Insights;
