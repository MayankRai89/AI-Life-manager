import React from "react";
import { AlertCircle, RotateCcw, Sparkles } from "lucide-react";

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Application Error Boundary caught an error:", error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-slate-800">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-lg space-y-5">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-50 text-teal-600 border border-teal-100">
              <Sparkles className="h-7 w-7" />
            </div>

            <div className="space-y-2">
              <h1 className="text-xl font-extrabold text-slate-900">
                Something didn't go quite as planned
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                Take a steady breath. We ran into an unexpected hiccup loading this screen, but your data is safe.
              </p>
            </div>

            <button
              type="button"
              onClick={this.handleReload}
              className="inline-flex items-center justify-center gap-2 w-full rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs py-3 px-4 shadow-sm transition cursor-pointer"
            >
              <RotateCcw className="h-4 w-4" />
              <span>Reload Application</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
