import { useState } from "react";
import { UploadCloud, FileText, CheckCircle, AlertCircle, Loader2, Cpu } from "lucide-react";
import api from "../api";

export default function MedicalReportUpload({ onReportUploaded }) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [successResult, setSuccessResult] = useState(null);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      setFile(selected);
      setError("");
      setSuccessResult(null);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      setError("Please select a medical report file (PDF or DOCX).");
      return;
    }

    setUploading(true);
    setError("");
    setSuccessResult(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await api.post("/medical-reports/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data?.success) {
        setSuccessResult(response.data.data);
        setFile(null);
        if (onReportUploaded) {
          onReportUploaded(response.data.data);
        }
      } else {
        setError(response.data?.message || "Failed to parse document.");
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "Error uploading & parsing document with LlamaCloud.",
      );
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-md">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-indigo-400">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
              Medical Report Parser
              <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                <Cpu className="w-3 h-3" /> LlamaCloud Agentic
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Upload blood test or health lab report (.pdf, .docx) to extract & save to your profile
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleUpload} className="space-y-4">
        <label className="border-2 border-dashed border-slate-700 hover:border-indigo-500/50 transition-colors rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer bg-slate-950/40 group">
          <UploadCloud className="w-10 h-10 text-slate-500 group-hover:text-indigo-400 transition-colors mb-2" />
          <span className="text-sm font-medium text-slate-300">
            {file ? file.name : "Click or drag medical report file here"}
          </span>
          <span className="text-xs text-slate-500 mt-1">Supports PDF (.pdf) and Word (.docx, .doc) up to 15MB</span>
          <input
            type="file"
            accept=".pdf,.docx,.doc,.txt"
            onChange={handleFileChange}
            className="hidden"
          />
        </label>

        {error && (
          <div className="flex items-center gap-2 text-sm text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-xl p-3">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={!file || uploading}
          className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-600 hover:to-cyan-600 font-medium text-white shadow-lg shadow-indigo-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {uploading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Parsing with LlamaCloud AI...</span>
            </>
          ) : (
            <>
              <UploadCloud className="w-5 h-5" />
              <span>Extract & Save Report Data</span>
            </>
          )}
        </button>
      </form>

      {successResult && (
        <div className="mt-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 space-y-3">
          <div className="flex items-center gap-2 text-emerald-400 font-medium">
            <CheckCircle className="w-5 h-5" />
            <span>Medical Report Parsed & Saved!</span>
          </div>
          <p className="text-xs text-slate-300">{successResult.report?.summary}</p>

          {successResult.report?.metrics && successResult.report.metrics.length > 0 && (
            <div className="mt-3">
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Extracted Health Metrics
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {successResult.report.metrics.map((m, idx) => (
                  <div key={idx} className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800 flex justify-between items-center">
                    <div>
                      <div className="text-xs text-slate-300 font-medium">{m.name}</div>
                      <div className="text-xs text-slate-400">{m.referenceRange !== "N/A" ? `Ref: ${m.referenceRange}` : ""}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-bold text-indigo-300">{m.value} {m.unit}</div>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                        m.status === 'High' ? 'bg-rose-500/20 text-rose-300' :
                        m.status === 'Low' ? 'bg-amber-500/20 text-amber-300' :
                        'bg-emerald-500/20 text-emerald-300'
                      }`}>
                        {m.status}
                      </span>
                    </div>
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
