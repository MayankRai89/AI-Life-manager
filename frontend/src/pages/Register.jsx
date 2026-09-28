import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { registerUser, clearAuthError } from "../redux/slices/authSlice";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Card } from "../components/ui/Card";
import {
  Sparkles,
  User,
  AtSign,
  Mail,
  Lock,
  Phone,
  Calendar,
  Globe,
  Eye,
  EyeOff,
  Clock,
  HeartPulse,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

export function Register() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);

  // Form State
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [usernameTouched, setUsernameTouched] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("prefer_not_to_say");

  // Default to system timezone if available
  const [timezone, setTimezone] = useState(() => {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
    } catch {
      return "UTC";
    }
  });

  const [validationError, setValidationError] = useState("");

  // Auto-generate username suggestion from name until user manually alters username
  const handleNameChange = (e) => {
    const val = e.target.value;
    setName(val);
    dispatch(clearAuthError());
    setValidationError("");

    if (!usernameTouched) {
      const generated = val
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9_.-]/g, "_")
        .slice(0, 30);
      setUsername(generated);
    }
  };

  const handleUsernameChange = (e) => {
    setUsernameTouched(true);
    setUsername(e.target.value);
    dispatch(clearAuthError());
    setValidationError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError("");

    // Required fields check
    if (!name.trim()) {
      setValidationError("Full Name is required.");
      return;
    }
    if (name.trim().length < 2 || name.trim().length > 50) {
      setValidationError("Name must be between 2 and 50 characters.");
      return;
    }

    const cleanUsername = username.trim().toLowerCase();
    if (!cleanUsername) {
      setValidationError("Username is required.");
      return;
    }
    if (cleanUsername.length < 3 || cleanUsername.length > 30) {
      setValidationError("Username must be between 3 and 30 characters.");
      return;
    }
    const usernameRegex = /^[a-zA-Z0-9_.-]+$/;
    if (!usernameRegex.test(cleanUsername)) {
      setValidationError(
        "Username can only contain alphanumeric characters, dots, underscores, and dashes."
      );
      return;
    }

    if (!email.trim()) {
      setValidationError("Email is required.");
      return;
    }
    if (!password || password.length < 8) {
      setValidationError("Password must be at least 8 characters long.");
      return;
    }

    if (age && (Number(age) < 1 || Number(age) > 120)) {
      setValidationError("Age must be between 1 and 120.");
      return;
    }

    const payload = {
      name: name.trim(),
      username: cleanUsername,
      email: email.trim().toLowerCase(),
      password,
      timezone: timezone || "UTC",
    };

    if (phoneNumber.trim()) {
      payload.phoneNumber = phoneNumber.trim();
    }
    if (age !== "" && age !== null && age !== undefined) {
      payload.age = Number(age);
    }
    if (gender) {
      payload.gender = gender;
    }

    const result = await dispatch(registerUser(payload));
    if (!result.error) {
      navigate("/dashboard");
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-10">
      <div className="w-full max-w-xl space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-teal-600 to-cyan-500 text-white shadow-md shadow-teal-500/20">
            <Sparkles className="h-6 w-6" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800">
            Begin Mindful Productivity
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
            Create your account to calibrate your day to your cognitive and biological rhythm
          </p>
        </div>

        {/* Card Form */}
        <Card className="p-6 sm:p-8 space-y-6 border-slate-200/90 shadow-lg bg-white/95 backdrop-blur-xs">
          {(error || validationError) && (
            <div className="rounded-xl bg-rose-50 border border-rose-200 p-3.5 text-xs text-rose-600 flex items-start gap-2.5">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-500 mt-0.5" />
              <span>{error || validationError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Section 1: Account Credentials */}
            <div className="space-y-4">
              <div className="border-b border-slate-100 pb-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-teal-700 flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5" />
                  Account Credentials
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Full Name *"
                  placeholder="e.g. Alex Rivera"
                  value={name}
                  onChange={handleNameChange}
                  required
                  minLength={2}
                  maxLength={50}
                />

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                    <AtSign className="h-3 w-3 text-slate-400" />
                    Username *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. alex_rivera"
                    value={username}
                    onChange={handleUsernameChange}
                    required
                    minLength={3}
                    maxLength={30}
                    pattern="^[a-zA-Z0-9_.-]+$"
                    title="Alphanumeric characters, dots, underscores, and dashes only"
                    className="flex h-11 w-full rounded-xl border border-slate-200 bg-white/80 px-3.5 py-2 text-sm text-slate-800 placeholder:text-slate-400 transition-all duration-150 focus:border-teal-500 focus:bg-white focus:outline-none focus:ring-3 focus:ring-teal-500/15"
                  />
                  <p className="text-[11px] text-slate-400">
                    3-30 chars (letters, numbers, _, ., -)
                  </p>
                </div>
              </div>

              <Input
                label="Email Address *"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => {
                  dispatch(clearAuthError());
                  setValidationError("");
                  setEmail(e.target.value);
                }}
                required
              />

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                  <Lock className="h-3 w-3 text-slate-400" />
                  Password *
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="At least 8 characters"
                    value={password}
                    onChange={(e) => {
                      dispatch(clearAuthError());
                      setValidationError("");
                      setPassword(e.target.value);
                    }}
                    required
                    minLength={8}
                    className="flex h-11 w-full rounded-xl border border-slate-200 bg-white/80 pl-3.5 pr-10 py-2 text-sm text-slate-800 placeholder:text-slate-400 transition-all duration-150 focus:border-teal-500 focus:bg-white focus:outline-none focus:ring-3 focus:ring-teal-500/15"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Section 2: Personal Profile (Optional) */}
            <div className="space-y-4">
              <div className="border-b border-slate-100 pb-2 flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-teal-700 flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  Personal Information (Optional)
                </h3>
                <span className="text-[11px] text-slate-400 font-medium">
                  Can be updated later
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                    <Phone className="h-3 w-3 text-slate-400" />
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    placeholder="+1 555 123 4567"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="flex h-11 w-full rounded-xl border border-slate-200 bg-white/80 px-3.5 py-2 text-sm text-slate-800 placeholder:text-slate-400 transition-all duration-150 focus:border-teal-500 focus:bg-white focus:outline-none focus:ring-3 focus:ring-teal-500/15"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Age
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={120}
                    placeholder="e.g. 28"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    className="flex h-11 w-full rounded-xl border border-slate-200 bg-white/80 px-3.5 py-2 text-sm text-slate-800 placeholder:text-slate-400 transition-all duration-150 focus:border-teal-500 focus:bg-white focus:outline-none focus:ring-3 focus:ring-teal-500/15"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Gender
                  </label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="flex h-11 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 focus:border-teal-500 focus:outline-none"
                  >
                    <option value="prefer_not_to_say">Prefer not to say</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                    <Globe className="h-3 w-3 text-slate-400" />
                    Timezone
                  </label>
                  <select
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                    className="flex h-11 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 focus:border-teal-500 focus:outline-none"
                  >
                    <option value="UTC">UTC</option>
                    <option value="America/New_York">America/New_York (EST)</option>
                    <option value="America/Chicago">America/Chicago (CST)</option>
                    <option value="America/Denver">America/Denver (MST)</option>
                    <option value="America/Los_Angeles">America/Los_Angeles (PST)</option>
                    <option value="Europe/London">Europe/London (GMT/BST)</option>
                    <option value="Europe/Paris">Europe/Paris (CET)</option>
                    <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                    <option value="Asia/Tokyo">Asia/Tokyo (JST)</option>
                    <option value="Australia/Sydney">Australia/Sydney (AEST)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Schedule & Health Notice */}
            <div className="rounded-xl bg-teal-50/70 border border-teal-100 p-3.5 text-xs text-teal-800 flex items-start gap-3">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-teal-600/10 text-teal-700">
                <Clock className="h-4 w-4" />
              </div>
              <div className="space-y-0.5">
                <p className="font-semibold text-teal-900">
                  Daily Rhythm & Health Profile
                </p>
                <p className="text-[11px] text-teal-700/90 leading-relaxed">
                  Your circadian schedule (wake/sleep/working hours) and health information can be set up comfortably after sign-in inside your Profile settings.
                </p>
              </div>
            </div>

            <Button
              type="submit"
              isLoading={loading}
              className="w-full rounded-xl py-3 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-sm shadow-md shadow-teal-600/20 transition-all duration-150"
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
