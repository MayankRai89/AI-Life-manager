import React from "react";
import { Link } from "react-router-dom";
import {
  ShieldCheck,
  Database,
  Cpu,
  Trash2,
  Stethoscope,
  ArrowLeft,
  Sparkles,
  Lock,
} from "lucide-react";

export function Privacy() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8 space-y-8">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-teal-700 transition"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Home</span>
        </Link>
        <div className="inline-flex items-center gap-1.5 rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700 border border-teal-200/60">
          <ShieldCheck className="h-3.5 w-3.5 text-teal-600" />
          <span>Plain Language Privacy</span>
        </div>
      </div>

      {/* Header */}
      <div className="space-y-2 border-b border-slate-200/80 pb-6">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800">
          Privacy Policy & Data Handling
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 leading-relaxed max-w-2xl">
          We believe in straightforward transparency. Here is exactly what data AI Life Manager collects, what is shared with AI providers, and how you maintain total ownership over your data.
        </p>
      </div>

      <div className="space-y-6">
        {/* Section 1: What is stored */}
        <section className="rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-xs space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
              <Database className="h-4.5 w-4.5" />
            </div>
            <h2 className="text-base font-bold text-slate-800">
              1. What We Store
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Your data is stored securely in our database to operate your personal account:
          </p>
          <ul className="list-disc list-inside text-xs sm:text-sm text-slate-600 space-y-1.5 pl-2">
            <li>
              <strong>Account Information:</strong> Name, username, email address, password hash (encrypted with bcrypt), and optional contact details.
            </li>
            <li>
              <strong>Mood & Energy Check-ins:</strong> Mood score, energy level, stress score, capacity level, and optional daily notes.
            </li>
            <li>
              <strong>Tasks:</strong> Task titles, descriptions, due dates, priorities, categories, and completion statuses.
            </li>
            <li>
              <strong>Rhythm & Schedule:</strong> Wake time, sleep time, and target working hours.
            </li>
            <li>
              <strong>Day Plans:</strong> Generated daily schedules and your feedback ratings. Plan ratings and the reasons you write are reviewed in aggregate by the app owner to improve plans, without your name or email.
            </li>
          </ul>
        </section>

        {/* Section 2: What is sent to AI Providers */}
        <section className="rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-xs space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-50 text-cyan-700">
              <Cpu className="h-4.5 w-4.5" />
            </div>
            <h2 className="text-base font-bold text-slate-800">
              2. What Is Sent to AI Providers
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            To generate daily plans, task priorities, and wellness nudges, our backend calls LLM providers (such as Google Gemini, Groq, or OpenRouter). We send strictly contextual planning parameters:
          </p>
          <ul className="list-disc list-inside text-xs sm:text-sm text-slate-600 space-y-1.5 pl-2">
            <li>Today's current mood, energy rating, and stress score.</li>
            <li>Active tasks, due dates, and priorities.</li>
            <li>Wake and sleep windows to calibrate daily pacing.</li>
            <li>
              <strong>Derived health flags only if consent is given:</strong> High-level flags (e.g. &ldquo;low physical strain recommended&rdquo;) are included only if you explicitly enable AI Personalization.
            </li>
            <li className="font-semibold text-slate-700">
              <strong>Never sent:</strong> Your raw medical documents, raw condition lists, medication records, or doctor notes are never transmitted to any AI provider.
            </li>
          </ul>
        </section>

        {/* Section 3: AI Personalization Consent */}
        <section className="rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-xs space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
              <Sparkles className="h-4.5 w-4.5" />
            </div>
            <h2 className="text-base font-bold text-slate-800">
              3. AI Personalization Is Optional & Off by Default
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            By default, AI recommendations only consider your mood and tasks. Inclusion of any health-related context is strictly opt-in via your Profile settings, and can be toggled on or off at any moment.
          </p>
        </section>

        {/* Section 4: Deleting your data */}
        <section className="rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-xs space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-50 text-rose-700">
              <Trash2 className="h-4.5 w-4.5" />
            </div>
            <h2 className="text-base font-bold text-slate-800">
              4. Complete Account & Data Deletion
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            You own your information. In your Profile settings, you can delete your account at any time. When you confirm deletion with your password:
          </p>
          <ul className="list-disc list-inside text-xs sm:text-sm text-slate-600 space-y-1.5 pl-2">
            <li>Your user account is permanently deleted.</li>
            <li>All associated tasks, mood check-ins, and day plans are immediately purged from our database.</li>
            <li>All active sessions and authentication cookies are invalidated.</li>
          </ul>
        </section>

        {/* Section 5: Wellness Disclaimer (Not Medical Advice) */}
        <section className="rounded-2xl border border-teal-200/80 bg-teal-50/40 p-5 sm:p-6 shadow-xs space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-100 text-teal-800">
              <Stethoscope className="h-4.5 w-4.5" />
            </div>
            <h2 className="text-base font-bold text-teal-900">
              5. Wellness Guidance — Not Medical Advice
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
            AI Life Manager provides daily organization, schedule pacing, and gentle wellness prompts. It is <strong>not a medical device, diagnosis tool, or substitute for professional medical care</strong>. Never ignore clinical advice or delay seeking medical attention based on suggestions provided by this application.
          </p>
        </section>
      </div>

      {/* Footer link back */}
      <div className="pt-4 border-t border-slate-200/70 text-center">
        <Link
          to="/dashboard"
          className="inline-flex items-center justify-center rounded-xl bg-teal-600 px-5 py-2.5 text-xs font-semibold text-white hover:bg-teal-700 shadow-sm transition"
        >
          Return to Dashboard
        </Link>
      </div>
    </div>
  );
}

export default Privacy;
