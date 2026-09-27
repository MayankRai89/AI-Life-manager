import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { updateUserProfile } from "../redux/slices/authSlice";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Card } from "../components/ui/Card";
import { User, Clock, Shield, Sparkles, Check, Globe } from "lucide-react";

export function Profile() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const [name, setName] = useState(user?.name || "Alex Rivera");
  const [email, setEmail] = useState(user?.email || "alex@example.com");
  const [timezone, setTimezone] = useState(
    user?.timezone || "America/New_York (EST)"
  );
  const [wakeTime, setWakeTime] = useState(
    user?.schedule?.wakeTime || "07:30"
  );
  const [sleepTime, setSleepTime] = useState(
    user?.schedule?.sleepTime || "23:00"
  );
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    dispatch(
      updateUserProfile({
        name,
        email,
        timezone,
        schedule: {
          wakeTime,
          sleepTime,
        },
      })
    );
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      {/* Header */}
      <div className="border-b border-slate-200/80 pb-6">
        <div className="inline-flex items-center gap-2 rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700 border border-teal-200/50 mb-1.5">
          <User className="h-3.5 w-3.5 text-teal-600" />
          <span>Account Settings</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800">
          User Profile & Preferences
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Customize your bio, daily sleep-wake rhythm, and timezone for tailored AI suggestions.
        </p>
      </div>

      {savedSuccess && (
        <div className="rounded-xl bg-teal-600 text-white px-4 py-2.5 text-xs font-semibold flex items-center gap-2 shadow-xs">
          <Check className="h-4 w-4" />
          <span>Profile preferences saved successfully!</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Basic Info Card */}
        <Card className="p-6 space-y-4">
          <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <User className="h-4 w-4 text-teal-600" />
            General Information
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <Input
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

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
              <option value="America/New_York (EST)">America/New_York (EST)</option>
              <option value="America/Los_Angeles (PST)">America/Los_Angeles (PST)</option>
              <option value="Europe/London (GMT)">Europe/London (GMT)</option>
              <option value="Europe/Paris (CET)">Europe/Paris (CET)</option>
              <option value="Asia/Kolkata (IST)">Asia/Kolkata (IST)</option>
              <option value="Asia/Tokyo (JST)">Asia/Tokyo (JST)</option>
            </select>
          </div>
        </Card>

        {/* Daily Circadian Rhythm Card */}
        <Card className="p-6 space-y-4">
          <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <Clock className="h-4 w-4 text-teal-600" />
            Circadian Rhythm & Daily Schedule
          </h2>
          <p className="text-xs text-slate-500">
            The AI engine uses your sleep and wake schedule to compute high-energy focus slots.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Typical Wake Time"
              type="time"
              value={wakeTime}
              onChange={(e) => setWakeTime(e.target.value)}
            />
            <Input
              label="Typical Sleep Time"
              type="time"
              value={sleepTime}
              onChange={(e) => setSleepTime(e.target.value)}
            />
          </div>
        </Card>

        <div className="flex justify-end pt-2">
          <Button type="submit" className="rounded-xl px-6 bg-teal-600 text-white hover:bg-teal-700">
            Save Preferences
          </Button>
        </div>
      </form>
    </div>
  );
}

export default Profile;
