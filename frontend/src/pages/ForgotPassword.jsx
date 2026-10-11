import React, { useState } from "react";
import { Link } from "react-router-dom";
import authApi from "../api/authApi";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Card } from "../components/ui/Card";
import { KeyRound, Mail, ArrowLeft, CheckCircle2, AlertCircle } from "lucide-react";

export function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || isLoading) return;

    setIsLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const res = await authApi.forgotPassword(email.trim());
      setSuccessMessage(
        res.message ||
          "If an account with that email exists, a password reset link has been sent."
      );
    } catch (err) {
      setErrorMessage(
        err.response?.data?.message ||
          "Something went wrong while requesting the reset link. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-teal-600 to-cyan-500 text-white shadow-md shadow-teal-500/20">
            <KeyRound className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-800">
            Reset Your Password
          </h1>
          <p className="text-xs text-slate-500 max-w-xs mx-auto">
            Enter your email and we'll send you a secure link to reset your account password.
          </p>
        </div>

        {/* Card */}
        <Card className="p-6 sm:p-8 space-y-5 border-slate-200 shadow-md">
          {successMessage ? (
            <div className="space-y-4">
              <div className="rounded-xl bg-teal-50 border border-teal-200/80 p-4 text-xs text-teal-900 space-y-2">
                <div className="flex items-center gap-2 font-bold text-teal-800">
                  <CheckCircle2 className="h-4 w-4 text-teal-600 shrink-0" />
                  <span>Check your inbox</span>
                </div>
                <p className="leading-relaxed">{successMessage}</p>
                <p className="text-[11px] text-teal-700">
                  The link is valid for 30 minutes. If you do not see it, check your spam folder or server console in development mode.
                </p>
              </div>

              <Link
                to="/login"
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Back to Sign In
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMessage && (
                <div className="rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs text-rose-600 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <Input
                label="Registered Email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => {
                  setErrorMessage("");
                  setEmail(e.target.value);
                }}
                required
              />

              <Button
                type="submit"
                isLoading={isLoading}
                className="w-full rounded-xl py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-semibold"
              >
                Send Reset Link
              </Button>

              <div className="pt-2 text-center">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-teal-700 transition"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Back to Sign In
                </Link>
              </div>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
}

export default ForgotPassword;
