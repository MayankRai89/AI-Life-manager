import { useEffect, useState, useCallback } from "react";
import { Activity, Heart, RefreshCw, AlertTriangle, ShieldCheck } from "lucide-react";
import api from "../api";

export default function HealthProfileWidget({ refreshTrigger }) {
  const [profile, setProfile] = useState(null);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchHealthData = useCallback(async () => {
    setLoading(true);
    try {
      const [profileRes, reportsRes] = await Promise.all([
        api.get("/medical-reports/profile"),
        api.get("/medical-reports"),
      ]);

      if (profileRes.data?.success) {
        setProfile(profileRes.data.data);
      }
      if (reportsRes.data?.success) {
        setReports(reportsRes.data.data);
      }
    } catch (err) {
      console.error("Error fetching health profile:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHealthData();
  }, [fetchHealthData, refreshTrigger]);

  const metricsMap = profile?.latestMetrics || {};
  const metricEntries = Object.entries(metricsMap);

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-md">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400">
            <Heart className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-100">User Health Profile</h3>
            <p className="text-xs text-slate-400">Extracted metrics from medical documents</p>
          </div>
        </div>
        <button
          onClick={fetchHealthData}
          className="p-2 text-slate-400 hover:text-slate-200 bg-slate-800/50 hover:bg-slate-800 rounded-xl transition-colors"
          title="Refresh Profile"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {metricEntries.length === 0 ? (
        <div className="text-center py-8 text-slate-500 border border-dashed border-slate-800 rounded-xl">
          <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm font-medium">No medical metrics logged yet</p>
          <p className="text-xs mt-1">Upload a medical report above to populate your health stats.</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {metricEntries.map(([name, data]) => (
              <div
                key={name}
                className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3 flex flex-col justify-between"
              >
                <div className="text-xs text-slate-400 font-medium truncate" title={name}>
                  {name}
                </div>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-base font-bold text-slate-100">{data.value}</span>
                  <span className="text-[11px] text-slate-400">{data.unit}</span>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${
                      data.status === "High"
                        ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                        : data.status === "Low"
                        ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                        : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                    }`}
                  >
                    {data.status}
                  </span>
                  {data.status === "High" || data.status === "Low" ? (
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                  ) : (
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  )}
                </div>
              </div>
            ))}
          </div>

          {reports.length > 0 && (
            <div className="pt-3 border-t border-slate-800">
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Recent Reports ({reports.length})
              </h4>
              <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                {reports.slice(0, 5).map((rep) => (
                  <div
                    key={rep._id}
                    className="flex justify-between items-center bg-slate-950/40 p-2 rounded-lg text-xs"
                  >
                    <span className="text-slate-300 truncate max-w-[200px]">{rep.fileName}</span>
                    <span className="text-slate-500 text-[11px]">
                      {new Date(rep.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
