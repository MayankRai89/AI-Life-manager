import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { registerUser, clearAuthError } from "../redux/slices/authSlice";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Card } from "../components/ui/Card";
import { Sparkles, Check, Globe } from "lucide-react";

export function Register() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);

  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [timezone, setTimezone] = useState("America/New_York");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) return;

    const payload = {
      name: name.trim(),
      username: (username.trim() || name.trim().toLowerCase().replace(/\s+/g, "_")),
      email: email.trim(),
      password,
      timezone,
    };

    const result = await dispatch(registerUser(payload));
    if (!result.error) {
      navigate("/dashboard");
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-teal-600 to-cyan-500 text-white shadow-md shadow-teal-500/20">
            <Sparkles className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-800">
            Begin Mindful Productivity
          </h1>
          <p className="text-xs text-slate-500">
            Create an account to calibrate your work to how you actually feel
          </p>
        </div>

        {/* Card Form */}
        <Card className="p-6 sm:p-8 space-y-5 border-slate-200 shadow-md">
          {error && (
            <div className="rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs text-rose-600">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Full Name *"
              placeholder="e.g. Alex Rivera"
              value={name}
              onChange={(e) => {
                dispatch(clearAuthError());
                setName(e.target.value);
              }}
              required
            />

            <Input
              label="Username (Optional)"
              placeholder="e.g. alex_rivera"
              value={username}
              onChange={(e) => {
                dispatch(clearAuthError());
                setUsername(e.target.value);
              }}
            />

            <Input
              label="Email Address *"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => {
                dispatch(clearAuthError());
                setEmail(e.target.value);
              }}
              required
            />

            <Input
              label="Password *"
              type="password"
              placeholder="At least 6 characters"
              value={password}
              onChange={(e) => {
                dispatch(clearAuthError());
                setPassword(e.target.value);
              }}
              required
              minLength={6}
            />

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Globe className="h-3.5 w-3.5 text-slate-400" />
                Timezone
              </label>
              <select
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 focus:border-teal-500 focus:outline-none"
              >
                <option value="America/New_York">America/New_York (EST)</option>
                <option value="America/Los_Angeles">America/Los_Angeles (PST)</option>
                <option value="Europe/London">Europe/London (GMT)</option>
                <option value="Europe/Paris">Europe/Paris (CET)</option>
                <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                <option value="Asia/Tokyo">Asia/Tokyo (JST)</option>
              </select>
            </div>

            <Button
              type="submit"
              isLoading={loading}
              className="w-full rounded-xl py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-semibold"
            >
              Create Account
            </Button>
          </form>
        </Card>

        {/* Login Prompt */}
        <p className="text-center text-xs text-slate-500">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-bold text-teal-600 hover:text-teal-700 transition"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
