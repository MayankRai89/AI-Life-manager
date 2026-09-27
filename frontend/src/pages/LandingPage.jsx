import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import {
  Sparkles,
  ArrowRight,
  HeartPulse,
  Zap,
  BellRing,
  CheckCircle2,
  Clock,
  Compass,
  Smile,
  Shield,
  GraduationCap,
  Heart,
  Droplets,
  Calendar,
  Check,
  Github,
  ChevronRight,
  ExternalLink,
} from "lucide-react";

export function LandingPage() {
  const [activeMoodMock, setActiveMoodMock] = useState("calm");

  const fadeInSlide = {
    initial: { opacity: 0, y: 24 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-60px" },
    transition: { duration: 0.55, ease: [0.21, 0.47, 0.32, 0.98] },
  };

  const moods = [
    { id: "motivated", label: "Motivated", emoji: "⚡", tag: "High Energy" },
    { id: "calm", label: "Calm", emoji: "🌿", tag: "Optimal Focus" },
    { id: "content", label: "Content", emoji: "✨", tag: "Steady Rhythm" },
    { id: "tired", label: "Tired", emoji: "🌙", tag: "Gentle Pacing" },
    { id: "anxious", label: "Anxious", emoji: "🌀", tag: "Low Friction" },
    { id: "stressed", label: "Stressed", emoji: "🌊", tag: "Decompression" },
  ];

  return (
    <div className="min-h-screen bg-[#fbfdfc] text-slate-800 selection:bg-teal-100 selection:text-teal-900 font-sans antialiased overflow-x-hidden">
      {/* 1. NAVBAR */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-200/70 bg-white/80 backdrop-blur-md transition-all">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo & Tag */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-teal-600 to-cyan-500 text-white shadow-xs transition-transform duration-200 group-hover:scale-105">
              <Sparkles className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-base tracking-tight text-slate-900">
                AI Life Manager
              </span>
              <span className="hidden sm:inline-block text-[10px] font-semibold text-teal-600 tracking-wide">
                Mood-Aware Productivity
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-7 text-xs font-semibold text-slate-600">
            <a
              href="#features"
              className="hover:text-teal-700 transition-colors"
            >
              Features
            </a>
            <a
              href="#how-it-works"
              className="hover:text-teal-700 transition-colors"
            >
              How It Works
            </a>
            <a
              href="#credibility"
              className="hover:text-teal-700 transition-colors"
            >
              Why We Built It
            </a>
          </nav>

          {/* Right CTAs */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            <Link
              to="/login"
              className="rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 transition"
            >
              Log In
            </Link>
            <Link
              to="/register"
              className="inline-flex items-center gap-1.5 rounded-xl bg-teal-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-teal-700 hover:shadow-md hover:shadow-teal-600/15 transition active:scale-[0.98]"
            >
              <span>Get Started Free</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* 2. HERO SECTION */}
      <section className="relative pt-16 pb-20 sm:pt-24 sm:pb-28 overflow-hidden">
        {/* Soft Ambient Background Elements */}
        <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 h-[520px] w-[900px] rounded-full bg-gradient-to-b from-teal-100/40 via-cyan-50/30 to-transparent blur-3xl -z-10" />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          {/* Calm Positioning Badge */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 rounded-full border border-teal-200/80 bg-teal-50/70 px-4 py-1.5 text-xs font-semibold text-teal-800 shadow-2xs mb-6"
          >
            <span className="flex h-2 w-2 rounded-full bg-teal-500 animate-pulse" />
            <span>Wellness meets productivity — no hustle culture</span>
          </motion.div>

          {/* Main Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.1 }}
            className="mx-auto max-w-4xl text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.12]"
          >
            One app that plans your day{" "}
            <span className="bg-gradient-to-r from-teal-600 via-cyan-600 to-emerald-600 bg-clip-text text-transparent">
              around how you feel.
            </span>
          </motion.h1>

          {/* One-line Subheading */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.2 }}
            className="mx-auto mt-6 max-w-2xl text-base sm:text-lg text-slate-600 leading-relaxed font-normal"
          >
            Ditch rigid schedules. Align your real energy levels with daily
            tasks, receive gentle wellness nudges, and conquer what matters
            without burnout.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.3 }}
            className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5"
          >
            <Link
              to="/register"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-teal-600 px-7 py-3.5 text-sm font-bold text-white shadow-md shadow-teal-600/20 hover:bg-teal-700 hover:shadow-lg hover:shadow-teal-600/25 transition active:scale-[0.98]"
            >
              <span>Get Started Free</span>
              <ArrowRight className="h-4 w-4" />
            </Link>

            <a
              href="#how-it-works"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200/90 bg-white/90 px-6 py-3.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition shadow-2xs"
            >
              <span>See how it works</span>
            </a>
          </motion.div>

          {/* Micro reassuring note */}
          <p className="mt-3 text-[11px] text-slate-400">
            Free during student beta · No credit card required · Instant setup
          </p>

          {/* STYLIZED DASHBOARD MOCKUP */}
          <motion.div
            initial={{ opacity: 0, y: 35 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="relative mx-auto mt-14 max-w-5xl text-left"
          >
            {/* Outer Ambient Glow */}
            <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-teal-500/15 via-cyan-500/10 to-indigo-500/10 blur-xl opacity-70" />

            <div className="relative rounded-3xl border border-slate-200/90 bg-white/95 p-4 sm:p-7 shadow-2xl backdrop-blur-xl">
              {/* Mockup Top Window Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4 mb-5">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-rose-400/80" />
                  <div className="h-3 w-3 rounded-full bg-amber-400/80" />
                  <div className="h-3 w-3 rounded-full bg-teal-400/80" />
                  <span className="ml-2 text-xs font-semibold text-slate-400">
                    AI Life Manager Dashboard — Today's Overview
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-50 border border-teal-200/60 px-3 py-1 text-[11px] font-semibold text-teal-700">
                    <span className="h-2 w-2 rounded-full bg-teal-500 animate-ping" />
                    Mood State: Calm & Centered
                  </span>
                </div>
              </div>

              {/* Mockup Interactive Mood Check-in Bar */}
              <div className="rounded-2xl border border-teal-100/90 bg-gradient-to-br from-teal-50/60 via-white to-cyan-50/30 p-4 mb-5 shadow-xs">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-teal-600" />
                    Morning Mood Check-in: Select your current mental energy
                  </span>
                  <span className="text-[10px] text-teal-700 font-semibold bg-teal-100/70 px-2 py-0.5 rounded-md">
                    Click to preview state
                  </span>
                </div>

                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {moods.map((m) => {
                    const isSelected = activeMoodMock === m.id;
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setActiveMoodMock(m.id)}
                        className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                          isSelected
                            ? "bg-white border-teal-500 shadow-md ring-2 ring-teal-500/20 -translate-y-0.5"
                            : "bg-white/60 border-slate-200/60 hover:bg-white text-slate-600"
                        }`}
                      >
                        <span className="text-xl mb-1">{m.emoji}</span>
                        <span className="text-[11px] font-bold text-slate-800">
                          {m.label}
                        </span>
                        <span className="text-[9px] text-slate-400 font-medium">
                          {m.tag}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Mockup Content Grid */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
                {/* Left: AI Day Rhythm */}
                <div className="md:col-span-7 rounded-2xl border border-slate-100 bg-slate-50/60 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-600 text-white">
                        <Compass className="h-4 w-4" />
                      </div>
                      <h4 className="text-xs font-bold text-slate-800">
                        AI-Generated Day Plan
                      </h4>
                    </div>
                    <span className="text-[10px] font-bold text-teal-700 bg-teal-100/80 px-2 py-0.5 rounded-full">
                      Pacing: Balanced
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed bg-white p-3 rounded-xl border border-slate-200/60">
                    "Energy is optimal at 7/10 with low cognitive friction. We
                    scheduled your deep architecture drafting during your peak
                    clarity window (09:30–11:30), followed by an outdoor walking
                    break."
                  </p>

                  {/* Step Sequence */}
                  <div className="space-y-2 pt-1">
                    <div className="flex items-center justify-between rounded-xl bg-white p-2.5 border border-slate-200/60 text-xs">
                      <div className="flex items-center gap-2.5">
                        <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-teal-100 font-bold text-[10px] text-teal-800">
                          1
                        </span>
                        <div>
                          <p className="font-bold text-slate-800 text-[11px]">
                            Draft project architecture proposal
                          </p>
                          <p className="text-[10px] text-slate-400">
                            Deep analytical focus window
                          </p>
                        </div>
                      </div>
                      <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                        09:30 - 11:30
                      </span>
                    </div>

                    <div className="flex items-center justify-between rounded-xl bg-white p-2.5 border border-slate-200/60 text-xs">
                      <div className="flex items-center gap-2.5">
                        <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-cyan-100 font-bold text-[10px] text-cyan-800">
                          2
                        </span>
                        <div>
                          <p className="font-bold text-slate-800 text-[11px]">
                            30-min mindful walk & hydration
                          </p>
                          <p className="text-[10px] text-slate-400">
                            Sensory reset before afternoon syncs
                          </p>
                        </div>
                      </div>
                      <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                        12:30 - 13:00
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Smart Task Prioritization */}
                <div className="md:col-span-5 rounded-2xl border border-slate-100 bg-slate-50/60 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <Zap className="h-3.5 w-3.5 text-teal-600" />
                      Prioritized Tasks
                    </h4>
                    <span className="text-[10px] text-slate-400">
                      Cognitive Scoring
                    </span>
                  </div>

                  {/* Task Card 1 */}
                  <div className="rounded-xl bg-white p-3 border border-teal-200/70 shadow-xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-teal-800 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-full">
                        <Zap className="h-2.5 w-2.5 text-teal-600 fill-teal-600" />
                        AI Score: 94
                      </span>
                      <span className="text-[10px] font-medium text-slate-400">
                        45 min
                      </span>
                    </div>
                    <p className="text-xs font-bold text-slate-800">
                      Review Q3 wellness & focus report
                    </p>
                    <p className="text-[10px] text-teal-700 italic">
                      High impact, aligns with morning focus
                    </p>
                  </div>

                  {/* Task Card 2 */}
                  <div className="rounded-xl bg-white p-3 border border-slate-200/70 shadow-xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-full">
                        AI Score: 82
                      </span>
                      <span className="text-[10px] font-medium text-slate-400">
                        25 min
                      </span>
                    </div>
                    <p className="text-xs font-bold text-slate-800">
                      Sort weekly emails & updates
                    </p>
                    <p className="text-[10px] text-slate-400">
                      Low cognitive demand, for afternoon wind-down
                    </p>
                  </div>

                  {/* Floating Gentle Nudge in Mockup */}
                  <div className="rounded-xl bg-gradient-to-r from-teal-50 to-emerald-50 border border-teal-200 p-2.5 flex items-center gap-2.5 text-[11px] text-teal-900 font-medium">
                    <Droplets className="h-4 w-4 text-teal-600 shrink-0" />
                    <span>Gentle Nudge: Drink water & rest eyes 20 secs.</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 3. FEATURES (3-column grid) */}
      <section id="features" className="py-20 sm:py-28 bg-white border-y border-slate-200/60">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeInSlide} className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-wider text-teal-700 bg-teal-50 inline-block px-3 py-1 rounded-full border border-teal-200/60 mb-3">
              Core Capabilities
            </h2>
            <p className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Designed around your mental energy, not just your clock.
            </p>
            <p className="mt-4 text-sm sm:text-base text-slate-500">
              Three pillars working together to prevent overload and help you
              accomplish meaningful work with peace of mind.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <motion.div
              {...fadeInSlide}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="relative rounded-3xl border border-slate-200/80 bg-slate-50/50 p-8 transition-all hover:bg-white hover:border-teal-300 hover:shadow-lg hover:shadow-teal-600/5 group"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-100 text-teal-700 transition-transform duration-200 group-hover:scale-110 mb-6">
                <Smile className="h-6 w-6 text-teal-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2.5">
                Mood-aware day planning
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Log your headspace with a single click. The AI calibrates your
                daily workload to match your mental bandwidth—reducing strain
                when you're exhausted and accelerating high-leverage tasks when
                you're energized.
              </p>
            </motion.div>

            {/* Feature 2 */}
            <motion.div
              {...fadeInSlide}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="relative rounded-3xl border border-slate-200/80 bg-slate-50/50 p-8 transition-all hover:bg-white hover:border-teal-300 hover:shadow-lg hover:shadow-teal-600/5 group"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-100 text-cyan-700 transition-transform duration-200 group-hover:scale-110 mb-6">
                <Zap className="h-6 w-6 text-cyan-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2.5">
                Smart task prioritization
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Move past arbitrary deadlines. Each action item receives an
                intelligent cognitive priority score that factors in estimated
                effort, complexity, and how grounded you feel today.
              </p>
            </motion.div>

            {/* Feature 3 */}
            <motion.div
              {...fadeInSlide}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="relative rounded-3xl border border-slate-200/80 bg-slate-50/50 p-8 transition-all hover:bg-white hover:border-teal-300 hover:shadow-lg hover:shadow-teal-600/5 group"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 transition-transform duration-200 group-hover:scale-110 mb-6">
                <BellRing className="h-6 w-6 text-emerald-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2.5">
                Gentle wellness nudges
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Receive respectful, timely reminders to hydrate, stretch, take
                deep breaths, or step outside. You are a human with physical
                limits, not an algorithmic machine.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 4. HOW IT WORKS (3-step horizontal flow with connecting lines) */}
      <section id="how-it-works" className="py-20 sm:py-28 bg-[#fbfdfc]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeInSlide} className="text-center max-w-3xl mx-auto mb-16 sm:mb-20">
            <h2 className="text-xs font-bold uppercase tracking-wider text-teal-700 bg-teal-50 inline-block px-3 py-1 rounded-full border border-teal-200/60 mb-3">
              Simple 3-Step Rhythm
            </h2>
            <p className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              How AI Life Manager brings balance to your routine
            </p>
            <p className="mt-4 text-sm sm:text-base text-slate-500">
              No complicated onboarding or rigid calendar blocking. Just three
              mindful steps each day.
            </p>
          </motion.div>

          <div className="relative">
            {/* Desktop Horizontal Connecting Line */}
            <div className="hidden md:block absolute top-24 left-[15%] right-[15%] h-0.5 bg-gradient-to-r from-teal-200 via-cyan-200 to-emerald-200 -z-0" />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8 relative z-10">
              {/* Step 1 */}
              <motion.div
                {...fadeInSlide}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="flex flex-col items-center text-center p-6 rounded-3xl bg-white/70 border border-slate-200/70 backdrop-blur-xs"
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-teal-600 text-white font-extrabold text-lg shadow-md shadow-teal-600/20 mb-6">
                  01
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-2">
                  Check in with your mood
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Start your morning or focus session by selecting your current
                  state—Motivated, Calm, Tired, or Stressed. Fine-tune with
                  simple energy and stress indicators.
                </p>
              </motion.div>

              {/* Step 2 */}
              <motion.div
                {...fadeInSlide}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="flex flex-col items-center text-center p-6 rounded-3xl bg-white/70 border border-slate-200/70 backdrop-blur-xs"
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-cyan-600 text-white font-extrabold text-lg shadow-md shadow-cyan-600/20 mb-6">
                  02
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-2">
                  AI builds your day
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  The AI evaluates your pending task list, analyzes cognitive
                  complexity, and outputs an achievable plan with recommended
                  task order and focus windows.
                </p>
              </motion.div>

              {/* Step 3 */}
              <motion.div
                {...fadeInSlide}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="flex flex-col items-center text-center p-6 rounded-3xl bg-white/70 border border-slate-200/70 backdrop-blur-xs"
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-600 text-white font-extrabold text-lg shadow-md shadow-emerald-600/20 mb-6">
                  03
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-2">
                  Stay on track with nudges
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Work in flow state while receiving unobtrusive reminders to
                  hydrate, breathe, and wrap up on time so you can recharge for
                  tomorrow.
                </p>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. SOCIAL PROOF / CREDIBILITY ("Built for students, by a student") */}
      <section id="credibility" className="py-20 sm:py-28 bg-white border-t border-slate-200/70">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <motion.div
            {...fadeInSlide}
            className="rounded-3xl border border-teal-200/70 bg-gradient-to-br from-teal-50/50 via-slate-50/60 to-white p-8 sm:p-12 shadow-sm text-center md:text-left"
          >
            <div className="flex flex-col md:flex-row items-center gap-8">
              {/* Creator Icon / Badge */}
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-3xl bg-teal-600 text-white shadow-lg shadow-teal-600/20">
                <GraduationCap className="h-10 w-10" />
              </div>

              {/* Story Copy */}
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 rounded-full bg-teal-100/70 px-3.5 py-1 text-xs font-bold text-teal-800">
                  <Heart className="h-3.5 w-3.5 text-teal-600 fill-teal-600" />
                  <span>Honest Origins: Built for students, by a student</span>
                </div>

                <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                  "Most productivity tools assume you're an emotionless machine."
                </h3>

                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Traditional productivity apps treat human energy as an
                  infinite bucket. They push relentless deadlines and guilt you
                  when fatigue, exams, or stress catch up with you.
                </p>

                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  We built <strong>AI Life Manager</strong> to provide an honest,
                  calm alternative. It's completely free while in active beta,
                  built transparently with modern open web standards, and
                  designed specifically to help students and busy creators stay
                  grounded.
                </p>

                {/* Principles checklist */}
                <div className="pt-2 flex flex-wrap gap-4 justify-center md:justify-start text-xs font-semibold text-slate-700">
                  <span className="flex items-center gap-1.5">
                    <Check className="h-4 w-4 text-teal-600" />
                    No fake reviews or vanity metrics
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Check className="h-4 w-4 text-teal-600" />
                    Zero hustle-porn guilt
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Check className="h-4 w-4 text-teal-600" />
                    Your data stays private
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 6. FINAL CTA */}
      <section className="py-20 sm:py-28 bg-[#fbfdfc] relative overflow-hidden">
        <div className="pointer-events-none absolute bottom-0 left-1/2 -translate-x-1/2 h-[350px] w-[700px] rounded-full bg-teal-100/30 blur-3xl -z-10" />

        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <motion.div {...fadeInSlide} className="space-y-6">
            <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
              Ready to work with your energy,{" "}
              <span className="bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
                not against it?
              </span>
            </h2>

            <p className="mx-auto max-w-xl text-sm sm:text-base text-slate-600 leading-relaxed">
              Start pacing your day with an empathetic AI assistant tailored to
              how you feel right now.
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3.5">
              <Link
                to="/register"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-teal-600 px-8 py-4 text-sm font-bold text-white shadow-lg shadow-teal-600/25 hover:bg-teal-700 hover:shadow-xl transition active:scale-[0.98]"
              >
                <span>Get Started Free — It Takes 30 Seconds</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <p className="text-xs text-slate-400">
              No credit card required · Free forever during student beta
            </p>
          </motion.div>
        </div>
      </section>

      {/* 7. FOOTER */}
      <footer className="border-t border-slate-200/70 bg-white py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            {/* Logo */}
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-teal-600 text-white shadow-xs">
                <Sparkles className="h-4 w-4" />
              </div>
              <span className="font-extrabold text-sm text-slate-800">
                AI Life Manager
              </span>
            </div>

            {/* Links */}
            <div className="flex items-center gap-6 text-xs font-semibold text-slate-500">
              <a href="#features" className="hover:text-teal-700 transition">
                Features
              </a>
              <a href="#how-it-works" className="hover:text-teal-700 transition">
                How It Works
              </a>
              <Link to="/login" className="hover:text-teal-700 transition">
                Sign In
              </Link>
              <Link to="/register" className="hover:text-teal-700 transition">
                Sign Up
              </Link>
              <a
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 hover:text-slate-800 transition"
              >
                <Github className="h-3.5 w-3.5" />
                <span>GitHub</span>
              </a>
            </div>

            {/* Copyright */}
            <p className="text-xs text-slate-400">
              © {new Date().getFullYear()} AI Life Manager. Crafted for mindful achievers.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
