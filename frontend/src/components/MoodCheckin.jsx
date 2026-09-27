import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  submitMoodCheckin,
  setSelectedMoodPreset,
} from "../redux/slices/moodSlice";
import { fetchAIDayPlan, fetchAIPrioritizedTasks } from "../redux/slices/aiSlice";
import { PRESET_MOODS } from "../mock/mockData";
import { Button } from "./ui/Button";
import { Sparkles, Check, ChevronDown, ChevronUp, Smile, BatteryMedium, ShieldAlert } from "lucide-react";

export function MoodCheckin() {
  const dispatch = useDispatch();
  const { currentMood, selectedMoodPreset, submitting, justSubmitted } = useSelector(
    (state) => state.mood
  );

  const [expanded, setExpanded] = useState(false);
  const [energyLevel, setEnergyLevel] = useState(
    currentMood?.energyLevel || 7
  );
  const [stressLevel, setStressLevel] = useState(
    currentMood?.stressLevel || 3
  );
  const [note, setNote] = useState("");
  const [feedbackMsg, setFeedbackMsg] = useState("");

  const activePreset =
    PRESET_MOODS.find((m) => m.id === selectedMoodPreset) || PRESET_MOODS[1];

  const handleSelectMood = (preset) => {
    dispatch(setSelectedMoodPreset(preset.id));
    setEnergyLevel(preset.energyLevel);
    setStressLevel(preset.stressLevel);
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    const payload = {
      mood: selectedMoodPreset,
      moodScore: activePreset.moodScore,
      energyLevel: Number(energyLevel),
      stressLevel: Number(stressLevel),
      note: note.trim() || `Feeling ${activePreset.label} today.`,
      emotions: [selectedMoodPreset],
    };

    const res = await dispatch(submitMoodCheckin(payload));
    if (!res.error) {
      setFeedbackMsg(`Mood logged as ${activePreset.label}. Updating your AI day plan...`);
      // Re-trigger AI daily suggestion and task prioritization
      dispatch(fetchAIDayPlan());
      dispatch(fetchAIPrioritizedTasks());
      setTimeout(() => setFeedbackMsg(""), 4500);
    }
  };

  return (
    <div className="relative overflow-hidden rounded-3xl border border-teal-100/80 bg-gradient-to-b from-white/95 to-teal-50/30 p-6 shadow-sm backdrop-blur-md transition-all duration-300 hover:shadow-md">
      {/* Magic UI / Aceternity inspired subtle background glow */}
      <div className="pointer-events-none absolute -top-24 -right-24 h-56 w-56 rounded-full bg-teal-200/25 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-24 h-56 w-56 rounded-full bg-cyan-200/20 blur-3xl" />

      {/* Header */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-4 pb-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700 border border-teal-200/50 mb-1.5">
            <Sparkles className="h-3.5 w-3.5 text-teal-600 animate-pulse" />
            <span>Mood-Aware Sync</span>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-slate-800">
            How is your mind feeling right now?
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Your day plan and task priority scores dynamically calibrate to this state.
          </p>
        </div>

        {currentMood && (
          <div className="flex items-center gap-2 rounded-2xl bg-white/90 border border-slate-200/70 px-3.5 py-1.5 shadow-xs">
            <span className="text-xs text-slate-500">Current State:</span>
            <span className="text-xs font-bold text-teal-700 capitalize flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span>
              </span>
              {currentMood.mood}
            </span>
          </div>
        )}
      </div>

      {/* Feedback banner */}
      {feedbackMsg && (
        <div className="relative z-10 mb-4 rounded-xl bg-teal-600 text-white px-4 py-2 text-xs font-medium flex items-center justify-between shadow-sm animate-in fade-in duration-300">
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4" />
            <span>{feedbackMsg}</span>
          </div>
        </div>
      )}

      {/* Preset Mood Buttons (Aceternity-inspired glowing interactive cards) */}
      <div className="relative z-10 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5 pt-2">
        {PRESET_MOODS.map((preset) => {
          const isSelected = selectedMoodPreset === preset.id;
          return (
            <button
              key={preset.id}
              type="button"
              onClick={() => handleSelectMood(preset)}
              className={`group relative flex flex-col items-center justify-center rounded-2xl p-3.5 text-center transition-all duration-300 cursor-pointer ${
                isSelected
                  ? "bg-white shadow-lg ring-2 ring-teal-500 -translate-y-1"
                  : "bg-white/70 hover:bg-white hover:shadow-md hover:-translate-y-0.5 border border-slate-200/60"
              }`}
            >
              {/* Subtle radiant sheen on selected */}
              {isSelected && (
                <div className="absolute inset-0 -z-10 rounded-2xl bg-gradient-to-tr from-teal-500/10 via-cyan-500/5 to-transparent blur-sm" />
              )}
              <span className="text-2xl mb-1.5 transition-transform group-hover:scale-110">
                {preset.emoji}
              </span>
              <span className="text-xs font-bold text-slate-800">
                {preset.label}
              </span>
              <span className="text-[10px] text-slate-400 line-clamp-1 mt-0.5 font-medium">
                {preset.description.split(",")[0]}
              </span>
            </button>
          );
        })}
      </div>

      {/* Expandable Nuance Controls (Sliders & Note) */}
      <div className="relative z-10 mt-4">
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-teal-700 transition cursor-pointer"
        >
          <span>{expanded ? "Hide deeper state details" : "Add energy & stress level nuance"}</span>
          {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        </button>

        {expanded && (
          <div className="mt-4 rounded-2xl border border-slate-200/70 bg-white/80 p-4 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Energy Level Slider */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold text-slate-600">
                  <span className="flex items-center gap-1.5">
                    <BatteryMedium className="h-3.5 w-3.5 text-teal-600" />
                    Energy Level
                  </span>
                  <span className="text-teal-700 font-bold">{energyLevel}/10</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={energyLevel}
                  onChange={(e) => setEnergyLevel(e.target.value)}
                  className="w-full accent-teal-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                />
              </div>

              {/* Stress Level Slider */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold text-slate-600">
                  <span className="flex items-center gap-1.5">
                    <ShieldAlert className="h-3.5 w-3.5 text-amber-600" />
                    Stress Level
                  </span>
                  <span className="text-amber-700 font-bold">{stressLevel}/10</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={stressLevel}
                  onChange={(e) => setStressLevel(e.target.value)}
                  className="w-full accent-amber-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                />
              </div>
            </div>

            {/* Note input */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600">
                Brief reflection (optional)
              </label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="e.g. Back-to-back meetings today, need clear focus blocks..."
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 placeholder:text-slate-400 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
              />
            </div>
          </div>
        )}
      </div>

      {/* Action CTA */}
      <div className="relative z-10 mt-5 flex items-center justify-between border-t border-slate-200/50 pt-4">
        <span className="text-xs text-slate-400">
          Selected: <strong className="text-slate-700 capitalize">{activePreset.label}</strong>
        </span>
        <Button
          onClick={handleSubmit}
          isLoading={submitting}
          className="rounded-xl px-5 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs tracking-wide shadow-md shadow-teal-600/15"
        >
          Check In & Recalibrate Plan
        </Button>
      </div>
    </div>
  );
}

export default MoodCheckin;
