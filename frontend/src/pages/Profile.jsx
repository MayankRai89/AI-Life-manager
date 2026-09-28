import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { saveUserProfile, updateUserProfile } from "../redux/slices/authSlice";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Card } from "../components/ui/Card";
import {
  User,
  Clock,
  Briefcase,
  HeartPulse,
  Sparkles,
  Check,
  Globe,
  Phone,
  AtSign,
  AlertCircle,
  Plus,
  X,
} from "lucide-react";

export function Profile() {
  const dispatch = useDispatch();
  const { user, loading } = useSelector((state) => state.auth);

  // General Info
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [username] = useState(user?.username || "");
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || "");
  const [age, setAge] = useState(user?.age ?? "");
  const [gender, setGender] = useState(user?.gender || "prefer_not_to_say");
  const [timezone, setTimezone] = useState(user?.timezone || "UTC");

  // Schedule
  const [wakeTime, setWakeTime] = useState(user?.schedule?.wakeTime || "07:00");
  const [sleepTime, setSleepTime] = useState(user?.schedule?.sleepTime || "23:00");
  const [workStart, setWorkStart] = useState(
    user?.schedule?.workingHours?.start || "09:00"
  );
  const [workEnd, setWorkEnd] = useState(
    user?.schedule?.workingHours?.end || "18:00"
  );

  // Medical Profile
  const [conditions, setConditions] = useState(
    user?.medicalReport?.conditions || []
  );
  const [allergies, setAllergies] = useState(
    user?.medicalReport?.allergies || []
  );
  const [medications, setMedications] = useState(
    user?.medicalReport?.medications || []
  );
  const [notes, setNotes] = useState(user?.medicalReport?.notes || "");

  // AI Personalization Consent (Off by default)
  const [aiPersonalizationConsent, setAiPersonalizationConsent] = useState(
    user?.consent?.aiPersonalization || false
  );

  // Tag inputs
  const [newCondition, setNewCondition] = useState("");
  const [newAllergy, setNewAllergy] = useState("");
  const [newMedication, setNewMedication] = useState("");

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const addTag = (type, val, setter, list) => {
    const trimmed = val.trim();
    if (trimmed && !list.includes(trimmed)) {
      setter([...list, trimmed]);
    }
  };

  const removeTag = (type, itemToRemove, setter, list) => {
    setter(list.filter((item) => item !== itemToRemove));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    const payload = {
      name: name.trim(),
      phoneNumber: phoneNumber.trim() || undefined,
      age: age !== "" && age !== null ? Number(age) : undefined,
      gender,
      timezone,
      schedule: {
        wakeTime,
        sleepTime,
        workingHours: {
          start: workStart,
          end: workEnd,
        },
      },
      medicalReport: {
        conditions,
        allergies,
        medications,
        notes: notes.trim(),
        documents: user?.medicalReport?.documents || [],
      },
      consent: {
        aiPersonalization: Boolean(aiPersonalizationConsent),
        consentedAt: aiPersonalizationConsent
          ? user?.consent?.consentedAt || new Date().toISOString()
          : null,
      },
    };

    try {
      // Optimistic update
      dispatch(updateUserProfile(payload));
      // Database persistence
      await dispatch(saveUserProfile(payload)).unwrap();
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 4000);
    } catch (err) {
      setErrorMessage(typeof err === "string" ? err : "Failed to update profile");
    }
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
          Customize your bio, daily sleep-wake rhythm, working hours, and medical profile for tailored AI task and energy recommendations.
        </p>
      </div>

      {savedSuccess && (
        <div className="rounded-xl bg-teal-600 text-white px-4 py-3 text-xs sm:text-sm font-semibold flex items-center gap-2.5 shadow-md">
          <Check className="h-4 w-4 shrink-0" />
          <span>Profile and health preferences saved successfully!</span>
        </div>
      )}

      {errorMessage && (
        <div className="rounded-xl bg-rose-50 border border-rose-200 p-3.5 text-xs text-rose-600 flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Basic Info Card */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <User className="h-4 w-4 text-teal-600" />
              General Information
            </h2>
            {username && (
              <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
                <AtSign className="h-3 w-3 text-slate-400" />
                {username}
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <Input
              label="Email Address (Account ID)"
              type="email"
              value={email}
              disabled
              className="bg-slate-50 text-slate-500 cursor-not-allowed"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
                className="flex h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:border-teal-500 focus:outline-none focus:ring-3 focus:ring-teal-500/15"
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
                className="flex h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:border-teal-500 focus:outline-none focus:ring-3 focus:ring-teal-500/15"
              />
            </div>

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
        </Card>

        {/* Daily Circadian Rhythm & Schedule Card */}
        <Card className="p-6 space-y-4">
          <div>
            <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <Clock className="h-4 w-4 text-teal-600" />
              Circadian Rhythm & Daily Schedule
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              The AI engine uses your sleep, wake, and work schedule to compute peak energy focus slots.
            </p>
          </div>

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

          <div className="pt-2 border-t border-slate-100">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5 mb-2.5">
              <Briefcase className="h-3.5 w-3.5 text-teal-600" />
              Working Hours
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Work Starts"
                type="time"
                value={workStart}
                onChange={(e) => setWorkStart(e.target.value)}
              />
              <Input
                label="Work Ends"
                type="time"
                value={workEnd}
                onChange={(e) => setWorkEnd(e.target.value)}
              />
            </div>
          </div>
        </Card>

        {/* Health & Medical Report Card */}
        <Card className="p-6 space-y-5">
          <div>
            <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <HeartPulse className="h-4 w-4 text-rose-500" />
              Health & Medical Context
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Helps your AI Life Manager align work sessions, reminders, and breaks around your physiological health needs.
            </p>
          </div>

          {/* AI Health Personalization Consent Toggle (Optional, Off by default) */}
          <div className="rounded-2xl border border-teal-200/80 bg-gradient-to-r from-teal-50/70 to-emerald-50/40 p-4 transition-all">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-teal-600" />
                  <span className="text-xs font-bold text-teal-900 uppercase tracking-wider">
                    AI Personalization Consent (Optional)
                  </span>
                  <span className="rounded-full bg-teal-100 px-2 py-0.5 text-[10px] font-semibold text-teal-700">
                    {aiPersonalizationConsent ? "Enabled" : "Off by Default"}
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed max-w-xl">
                  When enabled, non-identifying derived flags (e.g. &ldquo;avoid intense exercise&rdquo;, &ldquo;vegetarian preference&rdquo;) are factored into your daily schedule. Your raw medical conditions, medications, notes, and documents are <strong>never</strong> shared with any AI provider.
                </p>
                {aiPersonalizationConsent && user?.consent?.consentedAt && (
                  <p className="text-[10px] text-teal-700 font-medium pt-1">
                    Consented on: {new Date(user.consent.consentedAt).toLocaleDateString()}
                  </p>
                )}
              </div>
              <label className="relative inline-flex cursor-pointer items-center shrink-0 mt-1">
                <input
                  type="checkbox"
                  checked={aiPersonalizationConsent}
                  onChange={(e) => setAiPersonalizationConsent(e.target.checked)}
                  className="peer sr-only"
                />
                <div className="h-6 w-11 rounded-full bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-teal-500/20 peer peer-checked:after:translate-x-full peer-checked:after:border-white peer-checked:bg-teal-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
              </label>
            </div>
          </div>

          {/* Conditions */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Medical Conditions (e.g. Migraines, Asthma, ADHD)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Add condition and press Enter"
                value={newCondition}
                onChange={(e) => setNewCondition(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addTag("conditions", newCondition, setConditions, conditions);
                    setNewCondition("");
                  }
                }}
                className="flex-1 h-10 rounded-xl border border-slate-200 px-3 text-xs text-slate-800 focus:border-teal-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => {
                  addTag("conditions", newCondition, setConditions, conditions);
                  setNewCondition("");
                }}
                className="px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1"
              >
                <Plus className="h-3.5 w-3.5" /> Add
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {conditions.map((item, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1 rounded-lg bg-teal-50 border border-teal-200/60 px-2.5 py-1 text-xs text-teal-800 font-medium"
                >
                  {item}
                  <button
                    type="button"
                    onClick={() => removeTag("conditions", item, setConditions, conditions)}
                    className="hover:text-rose-500"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Allergies */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Allergies (e.g. Peanuts, Penicillin, Pollen)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Add allergy and press Enter"
                value={newAllergy}
                onChange={(e) => setNewAllergy(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addTag("allergies", newAllergy, setAllergies, allergies);
                    setNewAllergy("");
                  }
                }}
                className="flex-1 h-10 rounded-xl border border-slate-200 px-3 text-xs text-slate-800 focus:border-teal-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => {
                  addTag("allergies", newAllergy, setAllergies, allergies);
                  setNewAllergy("");
                }}
                className="px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1"
              >
                <Plus className="h-3.5 w-3.5" /> Add
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {allergies.map((item, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1 rounded-lg bg-amber-50 border border-amber-200/60 px-2.5 py-1 text-xs text-amber-800 font-medium"
                >
                  {item}
                  <button
                    type="button"
                    onClick={() => removeTag("allergies", item, setAllergies, allergies)}
                    className="hover:text-rose-500"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Medications */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Current Medications
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Add medication and press Enter"
                value={newMedication}
                onChange={(e) => setNewMedication(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addTag("medications", newMedication, setMedications, medications);
                    setNewMedication("");
                  }
                }}
                className="flex-1 h-10 rounded-xl border border-slate-200 px-3 text-xs text-slate-800 focus:border-teal-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => {
                  addTag("medications", newMedication, setMedications, medications);
                  setNewMedication("");
                }}
                className="px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1"
              >
                <Plus className="h-3.5 w-3.5" /> Add
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {medications.map((item, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1 rounded-lg bg-blue-50 border border-blue-200/60 px-2.5 py-1 text-xs text-blue-800 font-medium"
                >
                  {item}
                  <button
                    type="button"
                    onClick={() => removeTag("medications", item, setMedications, medications)}
                    className="hover:text-rose-500"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Health & Dietary Notes
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Needs frequent water reminders, high caffeine sensitivity in afternoons..."
              className="w-full rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-800 focus:border-teal-500 focus:outline-none focus:ring-3 focus:ring-teal-500/15"
            />
          </div>
        </Card>

        {/* Action Button */}
        <div className="flex justify-end pt-2">
          <Button
            type="submit"
            isLoading={loading}
            className="rounded-xl px-6 py-2.5 bg-teal-600 text-white font-semibold hover:bg-teal-700 shadow-sm"
          >
            Save Profile & Preferences
          </Button>
        </div>
      </form>
    </div>
  );
}

export default Profile;
