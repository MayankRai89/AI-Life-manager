import React, { useState, useEffect } from "react";
import { Loader2, Server } from "lucide-react";

export function ColdStartBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleStatus = (e) => {
      setIsVisible(Boolean(e.detail?.show));
    };

    window.addEventListener("app-cold-start-status", handleStatus);
    return () => {
      window.removeEventListener("app-cold-start-status", handleStatus);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed top-4 left-1/2 -translate-x-1/2 z-50 max-w-md w-[calc(100%-2rem)] pointer-events-none animate-in fade-in slide-in-from-top-2 duration-300"
    >
      <div className="flex items-center gap-3 rounded-2xl bg-slate-900/90 text-white px-4 py-3 shadow-xl backdrop-blur-md border border-slate-700/80 pointer-events-auto">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-teal-500/20 text-teal-400">
          <Loader2 className="h-4 w-4 animate-spin text-teal-400" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-slate-100 leading-snug">
            Waking up the server — this can take up to a minute on first load.
          </p>
        </div>
      </div>
    </div>
  );
}

export default ColdStartBanner;
