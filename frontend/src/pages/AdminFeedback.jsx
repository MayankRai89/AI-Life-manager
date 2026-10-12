import React, { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
} from "recharts";
import {
  ShieldCheck,
  ShieldAlert,
  ThumbsUp,
  ThumbsDown,
  RefreshCw,
  Filter,
  Layers,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  BarChart3,
  Calendar,
  AlertCircle,
  Inbox,
  Activity,
  ArrowRight,
} from "lucide-react";
import adminApi from "../api/adminApi";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";

export default function AdminFeedback() {
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  const [stats, setStats] = useState(null);
  const [feedbackData, setFeedbackData] = useState({
    items: [],
    pagination: { page: 1, limit: 20, total: 0, totalPages: 1 },
  });

  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingFeedback, setLoadingFeedback] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [filterRating, setFilterRating] = useState("all");
  const [filterProvider, setFilterProvider] = useState("all");
  const [filterPromptVersion, setFilterPromptVersion] = useState("all");
  const [page, setPage] = useState(1);
  const [days, setDays] = useState(30);

  // Expanded plan summaries
  const [expandedItems, setExpandedItems] = useState({});

  const toggleExpand = (id) => {
    setExpandedItems((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Fetch statistics
  const fetchStats = async () => {
    setLoadingStats(true);
    try {
      const res = await adminApi.getStats({ days });
      if (res?.data) {
        setStats(res.data);
      }
    } catch (err) {
      console.error("Failed to load admin stats:", err);
      setError(err?.response?.data?.message || "Failed to load admin statistics");
    } finally {
      setLoadingStats(false);
    }
  };

  // Fetch feedback items
  const fetchFeedback = async () => {
    setLoadingFeedback(true);
    try {
      const params = {
        page,
        limit: 20,
      };
      if (filterRating !== "all") params.rating = filterRating;
      if (filterProvider !== "all") params.provider = filterProvider;
      if (filterPromptVersion !== "all") params.promptVersion = filterPromptVersion;

      const res = await adminApi.getFeedback(params);
      if (res?.data) {
        setFeedbackData(res.data);
      }
    } catch (err) {
      console.error("Failed to load feedback list:", err);
      setError(err?.response?.data?.message || "Failed to load feedback list");
    } finally {
      setLoadingFeedback(false);
    }
  };

  useEffect(() => {
    if (user?.role === "admin") {
      fetchStats();
    }
  }, [user?.role, days]);

  useEffect(() => {
    if (user?.role === "admin") {
      fetchFeedback();
    }
  }, [user?.role, page, filterRating, filterProvider, filterPromptVersion]);

  // Auth Guard
  if (!isAuthenticated || user?.role !== "admin") {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-100 text-rose-600 shadow-sm">
          <ShieldAlert className="h-8 w-8" />
        </div>
        <h1 className="text-2xl font-bold text-slate-800">Access Restricted</h1>
        <p className="mt-3 text-sm text-slate-500">
          This page requires administrator privileges. Your current account does not have permission to view admin telemetry and user feedback.
        </p>
        <div className="mt-8">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-teal-700 transition"
          >
            <span>Return to Dashboard</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    );
  }

  // Summary Metrics
  const totalPlans = stats?.totalPlans || 0;
  const ratedPlans = stats?.ratedPlans || 0;
  const upCount = stats?.upCount || 0;
  const downCount = stats?.downCount || 0;
  const overallUpRate =
    ratedPlans > 0 ? Math.round((upCount / ratedPlans) * 100) : 0;

  // Chart Formatter Helpers (enforce small sample rule: < 5 ratings)
  const formatChartData = (breakdownList = []) => {
    return breakdownList.map((item) => {
      const isSmallSample = item.total < 5;
      const rate = item.total > 0 ? Math.round((item.up / item.total) * 100) : 0;
      return {
        key: item.key,
        up: item.up,
        down: item.down,
        total: item.total,
        rate: isSmallSample ? 0 : rate, // do not emphasize rate on small samples
        actualRate: rate,
        isSmallSample,
      };
    });
  };

  const providerChartData = formatChartData(stats?.byProvider || []);
  const capacityChartData = formatChartData(stats?.byCapacityLevel || []);
  const promptVersionChartData = formatChartData(stats?.byPromptVersion || []);
  const dailyTrendData = (stats?.byDay || []).map((d) => ({
    date: d.key,
    up: d.up,
    down: d.down,
    total: d.total,
  }));

  // Unique filter choices extracted dynamically from stats
  const availableProviders = Array.from(
    new Set((stats?.byProvider || []).map((p) => p.key).filter(Boolean))
  );
  const availablePromptVersions = Array.from(
    new Set((stats?.byPromptVersion || []).map((pv) => pv.key).filter(Boolean))
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-md bg-teal-100/80 px-2.5 py-0.5 text-xs font-bold text-teal-800">
              <ShieldCheck className="h-3.5 w-3.5" />
              Admin Telemetry
            </span>
            <span className="text-xs text-slate-400 font-medium">Privacy Preserved</span>
          </div>
          <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            AI Day Plan Feedback
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-500">
            Review aggregated rating metrics and anonymized plan feedback without personal identifiers.
          </p>
        </div>

        {/* Timeframe & Refresh controls */}
        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <select
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs hover:border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-teal-500"
          >
            <option value={7}>Last 7 Days</option>
            <option value={30}>Last 30 Days</option>
            <option value={90}>Last 90 Days</option>
          </select>
          <button
            onClick={() => {
              fetchStats();
              fetchFeedback();
            }}
            disabled={loadingStats || loadingFeedback}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 active:scale-95 transition disabled:opacity-50 cursor-pointer"
            title="Refresh statistics"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 text-slate-500 ${
                loadingStats || loadingFeedback ? "animate-spin" : ""
              }`}
            />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="flex items-center gap-3 rounded-2xl border border-rose-200 bg-rose-50/80 p-4 text-xs font-medium text-rose-800">
          <AlertCircle className="h-5 w-5 text-rose-600 shrink-0" />
          <p className="flex-1">{error}</p>
          <button
            onClick={() => setError(null)}
            className="text-rose-600 hover:text-rose-800 font-bold ml-2"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Section 1: Summary Cards (responsive at 375px: grid-cols-1 sm:grid-cols-3) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Plans */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Plans Generated
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-teal-50 text-teal-600">
              <Sparkles className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {loadingStats ? "..." : totalPlans.toLocaleString()}
            </span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400">
            Day plans generated within the selected {days}-day period
          </p>
        </div>

        {/* Total Rated Plans */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Rated Plans
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <Activity className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {loadingStats ? "..." : ratedPlans.toLocaleString()}
            </span>
            {totalPlans > 0 && (
              <span className="text-xs font-semibold text-slate-500">
                ({Math.round((ratedPlans / totalPlans) * 100)}% feedback rate)
              </span>
            )}
          </div>
          <p className="mt-1 text-[11px] text-slate-400">
            Plans where users provided thumbs up or thumbs down
          </p>
        </div>

        {/* Overall Thumbs-Up Satisfaction Rate */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Thumbs-Up Rate
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <ThumbsUp className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            {ratedPlans >= 5 ? (
              <span className="text-3xl font-extrabold text-emerald-700 tracking-tight">
                {overallUpRate}%
              </span>
            ) : ratedPlans > 0 ? (
              <span className="text-sm font-semibold text-slate-500 italic">
                too few ratings to compare
              </span>
            ) : (
              <span className="text-3xl font-extrabold text-slate-400">0%</span>
            )}
            <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
              {upCount} of {ratedPlans}
            </span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400">
            {downCount} thumbs-down ratings logged
          </p>
        </div>
      </div>

      {/* Section 2: Recharts Telemetry Visualizations */}
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-teal-600" />
          <h2 className="text-lg font-bold text-slate-900">Feedback Breakdown & Trends</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chart 1: By AI Provider */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-800">Thumbs-Up Rate by Provider</h3>
                <p className="text-[11px] text-slate-400">Performance comparison across AI backends</p>
              </div>
            </div>
            {providerChartData.length === 0 ? (
              <div className="h-56 flex flex-col items-center justify-center text-slate-400 text-xs">
                <Inbox className="h-8 w-8 mb-2 opacity-50" />
                No provider ratings available yet
              </div>
            ) : (
              <div>
                <div className="h-56 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={providerChartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="key" tick={{ fontSize: 11 }} />
                      <YAxis domain={[0, 100]} unit="%" tick={{ fontSize: 11 }} />
                      <Tooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            return (
                              <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-lg text-xs">
                                <p className="font-bold text-slate-800">{data.key}</p>
                                <p className="text-slate-600 mt-1">
                                  {data.up} up / {data.down} down ({data.total} total)
                                </p>
                                <p className="mt-1 font-semibold">
                                  {data.isSmallSample ? (
                                    <span className="text-slate-400 italic">too few ratings to compare</span>
                                  ) : (
                                    <span className="text-teal-700">{data.actualRate}% satisfaction</span>
                                  )}
                                </p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Bar dataKey="rate" fill="#0d9488" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                {/* Small sample labels and breakdown */}
                <div className="mt-3 flex flex-wrap gap-2 pt-2 border-t border-slate-100">
                  {providerChartData.map((item) => (
                    <div key={item.key} className="flex items-center gap-1.5 text-[11px] bg-slate-50 px-2 py-1 rounded-lg border border-slate-200/60">
                      <span className="font-semibold text-slate-700">{item.key}:</span>
                      {item.isSmallSample ? (
                        <span className="text-slate-400 italic font-medium">
                          {item.up} of {item.total} (too few ratings to compare)
                        </span>
                      ) : (
                        <span className="font-bold text-teal-700">
                          {item.actualRate}% ({item.up} of {item.total})
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Chart 2: By Capacity Level */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-800">Thumbs-Up Rate by Capacity Level</h3>
                <p className="text-[11px] text-slate-400">Plan reception across user energy / capacity</p>
              </div>
            </div>
            {capacityChartData.length === 0 ? (
              <div className="h-56 flex flex-col items-center justify-center text-slate-400 text-xs">
                <Inbox className="h-8 w-8 mb-2 opacity-50" />
                No capacity ratings available yet
              </div>
            ) : (
              <div>
                <div className="h-56 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={capacityChartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="key" tick={{ fontSize: 11 }} />
                      <YAxis domain={[0, 100]} unit="%" tick={{ fontSize: 11 }} />
                      <Tooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            return (
                              <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-lg text-xs">
                                <p className="font-bold text-slate-800 capitalize">{data.key} Capacity</p>
                                <p className="text-slate-600 mt-1">
                                  {data.up} up / {data.down} down ({data.total} total)
                                </p>
                                <p className="mt-1 font-semibold">
                                  {data.isSmallSample ? (
                                    <span className="text-slate-400 italic">too few ratings to compare</span>
                                  ) : (
                                    <span className="text-cyan-700">{data.actualRate}% satisfaction</span>
                                  )}
                                </p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Bar dataKey="rate" fill="#0284c7" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                {/* Small sample labels and breakdown */}
                <div className="mt-3 flex flex-wrap gap-2 pt-2 border-t border-slate-100">
                  {capacityChartData.map((item) => (
                    <div key={item.key} className="flex items-center gap-1.5 text-[11px] bg-slate-50 px-2 py-1 rounded-lg border border-slate-200/60">
                      <span className="font-semibold text-slate-700 capitalize">{item.key}:</span>
                      {item.isSmallSample ? (
                        <span className="text-slate-400 italic font-medium">
                          {item.up} of {item.total} (too few ratings to compare)
                        </span>
                      ) : (
                        <span className="font-bold text-cyan-700">
                          {item.actualRate}% ({item.up} of {item.total})
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Chart 3: By Prompt Version */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-800">Thumbs-Up Rate by Prompt Version</h3>
                <p className="text-[11px] text-slate-400">A/B prompt iteration evaluation</p>
              </div>
            </div>
            {promptVersionChartData.length === 0 ? (
              <div className="h-56 flex flex-col items-center justify-center text-slate-400 text-xs">
                <Inbox className="h-8 w-8 mb-2 opacity-50" />
                No prompt version ratings available yet
              </div>
            ) : (
              <div>
                <div className="h-56 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={promptVersionChartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="key" tick={{ fontSize: 11 }} />
                      <YAxis domain={[0, 100]} unit="%" tick={{ fontSize: 11 }} />
                      <Tooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            return (
                              <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-lg text-xs">
                                <p className="font-bold text-slate-800">Version: {data.key}</p>
                                <p className="text-slate-600 mt-1">
                                  {data.up} up / {data.down} down ({data.total} total)
                                </p>
                                <p className="mt-1 font-semibold">
                                  {data.isSmallSample ? (
                                    <span className="text-slate-400 italic">too few ratings to compare</span>
                                  ) : (
                                    <span className="text-indigo-700">{data.actualRate}% satisfaction</span>
                                  )}
                                </p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Bar dataKey="rate" fill="#6366f1" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                {/* Small sample labels and breakdown */}
                <div className="mt-3 flex flex-wrap gap-2 pt-2 border-t border-slate-100">
                  {promptVersionChartData.map((item) => (
                    <div key={item.key} className="flex items-center gap-1.5 text-[11px] bg-slate-50 px-2 py-1 rounded-lg border border-slate-200/60">
                      <span className="font-semibold text-slate-700">v: {item.key}:</span>
                      {item.isSmallSample ? (
                        <span className="text-slate-400 italic font-medium">
                          {item.up} of {item.total} (too few ratings to compare)
                        </span>
                      ) : (
                        <span className="font-bold text-indigo-700">
                          {item.actualRate}% ({item.up} of {item.total})
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Chart 4: Daily Trend */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-800">Daily Trend of Ratings</h3>
                <p className="text-[11px] text-slate-400">Volume and sentiment distribution over time</p>
              </div>
            </div>
            {dailyTrendData.length === 0 ? (
              <div className="h-56 flex flex-col items-center justify-center text-slate-400 text-xs">
                <Inbox className="h-8 w-8 mb-2 opacity-50" />
                No daily rating trends available yet
              </div>
            ) : (
              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={dailyTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-lg text-xs">
                              <p className="font-bold text-slate-800">{data.date}</p>
                              <p className="text-emerald-700 font-semibold mt-1">👍 Up: {data.up}</p>
                              <p className="text-rose-700 font-semibold">👎 Down: {data.down}</p>
                              <p className="text-slate-500 mt-1 border-t border-slate-100 pt-1">
                                Total: {data.total}
                              </p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: 11, paddingTop: 6 }} />
                    <Line
                      type="monotone"
                      dataKey="up"
                      name="Thumbs Up"
                      stroke="#059669"
                      strokeWidth={2}
                      dot={{ r: 3 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="down"
                      name="Thumbs Down"
                      stroke="#e11d48"
                      strokeWidth={2}
                      dot={{ r: 3 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Section 3: Filterable Feedback Table */}
      <div className="rounded-2xl border border-slate-200/80 bg-white shadow-xs overflow-hidden">
        {/* Table Filters Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-200/80 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-slate-500" />
            <h3 className="text-sm font-bold text-slate-800">
              User Feedback Logs ({feedbackData.pagination.total || 0})
            </h3>
            <span className="text-[11px] text-slate-400">(Thumbs down prioritized)</span>
          </div>

          {/* Filter Selects */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Rating Filter */}
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-slate-400 font-medium">Rating:</span>
              <select
                value={filterRating}
                onChange={(e) => {
                  setFilterRating(e.target.value);
                  setPage(1);
                }}
                className="rounded-xl border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 shadow-2xs hover:border-slate-300 focus:outline-hidden"
              >
                <option value="all">All Ratings</option>
                <option value="down">👎 Thumbs Down</option>
                <option value="up">👍 Thumbs Up</option>
              </select>
            </div>

            {/* Provider Filter */}
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-slate-400 font-medium">Provider:</span>
              <select
                value={filterProvider}
                onChange={(e) => {
                  setFilterProvider(e.target.value);
                  setPage(1);
                }}
                className="rounded-xl border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 shadow-2xs hover:border-slate-300 focus:outline-hidden"
              >
                <option value="all">All Providers</option>
                {availableProviders.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>

            {/* Prompt Version Filter */}
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-slate-400 font-medium">Version:</span>
              <select
                value={filterPromptVersion}
                onChange={(e) => {
                  setFilterPromptVersion(e.target.value);
                  setPage(1);
                }}
                className="rounded-xl border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 shadow-2xs hover:border-slate-300 focus:outline-hidden"
              >
                <option value="all">All Versions</option>
                {availablePromptVersions.map((pv) => (
                  <option key={pv} value={pv}>
                    {pv}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Table Content or Empty State */}
        {loadingFeedback ? (
          <div className="py-20 flex flex-col items-center justify-center text-slate-400 text-xs">
            <RefreshCw className="h-6 w-6 animate-spin mb-3 text-teal-600" />
            Loading feedback logs...
          </div>
        ) : feedbackData.items.length === 0 ? (
          <div className="py-20 px-4 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
              <Inbox className="h-7 w-7" />
            </div>
            <h4 className="text-sm font-bold text-slate-800">
              No feedback yet
            </h4>
            <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
              Ratings appear here once users rate their day plans.
            </p>
          </div>
        ) : (
          <div className="w-full overflow-x-auto">
            <table className="w-full min-w-[760px] text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200/80 bg-slate-50/70 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Rating</th>
                  <th className="py-3 px-4">Reason</th>
                  <th className="py-3 px-4">Mood</th>
                  <th className="py-3 px-4">Capacity</th>
                  <th className="py-3 px-4">Provider</th>
                  <th className="py-3 px-4">Version</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Plan Summary</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {feedbackData.items.map((item) => {
                  const isExpanded = !!expandedItems[item.id];
                  const hasReason = item.reason && item.reason.trim().length > 0;
                  const isUp = item.rating === "up";

                  return (
                    <tr
                      key={item.id}
                      className={`transition hover:bg-slate-50/60 ${
                        !isUp ? "bg-rose-50/20" : ""
                      }`}
                    >
                      {/* AnonId */}
                      <td className="py-3 px-4">
                        <span className="font-mono text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200/60">
                          {item.anonId || "anon"}
                        </span>
                      </td>

                      {/* Rating */}
                      <td className="py-3 px-4">
                        {isUp ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100/80 text-emerald-800 px-2.5 py-0.5 text-[11px] font-bold">
                            <ThumbsUp className="h-3 w-3 text-emerald-600" />
                            Up
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-rose-100/80 text-rose-800 px-2.5 py-0.5 text-[11px] font-bold">
                            <ThumbsDown className="h-3 w-3 text-rose-600" />
                            Down
                          </span>
                        )}
                      </td>

                      {/* Reason */}
                      <td className="py-3 px-4 max-w-[200px]">
                        {hasReason ? (
                          <p className="text-slate-800 font-medium break-words">
                            "{item.reason}"
                          </p>
                        ) : (
                          <span className="text-slate-400 italic">None provided</span>
                        )}
                      </td>

                      {/* Mood */}
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-700 capitalize">
                          {item.mood || "neutral"}
                        </span>
                      </td>

                      {/* Capacity */}
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-semibold capitalize ${
                            item.capacityLevel === "low"
                              ? "bg-amber-100 text-amber-800"
                              : item.capacityLevel === "high"
                              ? "bg-teal-100 text-teal-800"
                              : "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {item.capacityLevel || "normal"}
                        </span>
                      </td>

                      {/* Provider */}
                      <td className="py-3 px-4">
                        <span className="text-slate-600 font-mono text-[11px]">
                          {item.provider || "unknown"}
                        </span>
                      </td>

                      {/* Prompt Version */}
                      <td className="py-3 px-4">
                        <span className="rounded bg-indigo-50 border border-indigo-100 px-1.5 py-0.5 font-mono text-[11px] text-indigo-700 font-bold">
                          {item.promptVersion || "v0"}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                        {item.date || "N/A"}
                      </td>

                      {/* Summary with expand/collapse */}
                      <td className="py-3 px-4 max-w-[240px]">
                        {item.summary ? (
                          <div>
                            <p
                              className={`text-slate-600 ${
                                isExpanded ? "" : "line-clamp-2"
                              }`}
                            >
                              {item.summary}
                            </p>
                            <button
                              onClick={() => toggleExpand(item.id)}
                              className="mt-1 flex items-center gap-1 text-[10px] font-bold text-teal-700 hover:text-teal-900 cursor-pointer"
                            >
                              {isExpanded ? (
                                <>
                                  <span>Show less</span>
                                  <ChevronUp className="h-3 w-3" />
                                </>
                              ) : (
                                <>
                                  <span>Expand summary</span>
                                  <ChevronDown className="h-3 w-3" />
                                </>
                              )}
                            </button>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">No summary text</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {feedbackData.pagination.totalPages > 1 && (
          <div className="p-4 border-t border-slate-200/80 bg-slate-50/50 flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">
              Page {feedbackData.pagination.page} of {feedbackData.pagination.totalPages}
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={feedbackData.pagination.page <= 1 || loadingFeedback}
                className="gap-1"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                <span>Previous</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setPage((p) =>
                    Math.min(feedbackData.pagination.totalPages, p + 1)
                  )
                }
                disabled={
                  feedbackData.pagination.page >=
                    feedbackData.pagination.totalPages || loadingFeedback
                }
                className="gap-1"
              >
                <span>Next</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
