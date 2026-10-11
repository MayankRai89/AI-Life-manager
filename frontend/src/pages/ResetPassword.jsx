import React, { useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import authApi from "../api/authApi";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Card } from "../components/ui/Card";
import { Lock, CheckCircle2, AlertCircle, ArrowLeft } from "lucide-react";

export function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (!token) {
      setErrorMessage("Reset token is missing from the URL.");
      return;
    }

    if (password.length < 8) {
      setErrorMessage("Password must be at least 8 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await authApi.resetPassword(token, password);
      setSuccessMessage(
        res.message ||
          "Password reset successfully. You can now log in with your new password."
      );
    } catch (err) {
      setErrorMessage(
        err.response?.data?.message ||
          "Password reset link is invalid or has expired. Please request a new one."
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
            <Lock className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-800">
            Set New Password
          </h1>
          <p className="text-xs text-slate-500 max-w-xs mx-auto">
            Choose a strong password with at least 8 characters for your account.
          </p>
        </div>

        {/* Card */}
        <Card className="p-6 sm:p-8 space-y-5 border-slate-200 shadow-md">
          {successMessage ? (
            <div className="space-y-4">
              <div className="rounded-xl bg-teal-50 border border-teal-200/80 p-4 text-xs text-teal-900 space-y-2">
                <div className="flex items-center gap-2 font-bold text-teal-800">
                  <CheckCircle2 className="h-4 w-4 text-teal-600 shrink-0" />
                  <span>Success!</span>
                </div>
                <p className="leading-relaxed">{successMessage}</p>
              </div>

              <Link
                to="/login"
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-teal-600 py-2.5 text-xs font-semibold text-white hover:bg-teal-700 shadow-sm transition"
              >
                Continue to Sign In
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMessage && (
                <div className="rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs text-rose-600 flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p>{errorMessage}</p>
                    {errorMessage.includes("expired") && (
                      <Link
                        to="/forgot-password"
                        className="inline-block text-[11px] font-semibold text-rose-700 underline"
                      >
                        Request a new reset link
                      </Link>
                    )}
                  </div>
                </div>
              )}

              <Input
                label="New Password"
                type="password"
                placeholder="At least 8 characters"
                value={password}
                onChange={(e) => {
                  setErrorMessage("");
                  setPassword(e.target.value);
                }}
                required
                minLength={8}
              />

              <Input
                label="Confirm New Password"
                type="password"
                placeholder="Re-type your password"
                value={confirmPassword}
                onChange={(e) => {
                  setErrorMessage("");
                  setConfirmPassword(e.target.value);
                }}
                required
                minLength={8}
              />

              <Button
                type="submit"
                isLoading={isLoading}
                className="w-full rounded-xl py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-semibold"
              >
                Update Password
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

export default ResetPassword;
