/**
 * Single source of truth for mood presets and values in the frontend.
 * Kept in sync with the backend moodCheckIns schema enum.
 */

export const MOOD_OPTIONS = [
  {
    id: "motivated",
    value: "motivated",
    label: "Motivated",
    emoji: "⚡",
    description: "High energy, focused & ready to conquer",
    moodScore: 9,
    energyLevel: 9,
    stressLevel: 3,
    color: "from-emerald-500/20 to-teal-500/10 border-emerald-500/30 text-emerald-800",
    activeColor: "bg-emerald-600 text-white ring-emerald-400 shadow-emerald-500/20",
    accent: "#059669",
  },
  {
    id: "calm",
    value: "calm",
    label: "Calm",
    emoji: "🌿",
    description: "Peaceful, centered & steady pace",
    moodScore: 8,
    energyLevel: 6,
    stressLevel: 2,
    color: "from-teal-500/20 to-cyan-500/10 border-teal-500/30 text-teal-800",
    activeColor: "bg-teal-600 text-white ring-teal-400 shadow-teal-500/20",
    accent: "#0d9488",
  },
  {
    id: "content",
    value: "content",
    label: "Content",
    emoji: "✨",
    description: "Balanced, grateful & relaxed",
    moodScore: 8,
    energyLevel: 7,
    stressLevel: 2,
    color: "from-sky-500/20 to-blue-500/10 border-sky-500/30 text-sky-800",
    activeColor: "bg-sky-600 text-white ring-sky-400 shadow-sky-500/20",
    accent: "#0284c7",
  },
  {
    id: "tired",
    value: "tired",
    label: "Tired",
    emoji: "🌙",
    description: "Low battery, need gentle momentum",
    moodScore: 4,
    energyLevel: 3,
    stressLevel: 4,
    color: "from-indigo-500/20 to-violet-500/10 border-indigo-500/30 text-indigo-800",
    activeColor: "bg-indigo-600 text-white ring-indigo-400 shadow-indigo-500/20",
    accent: "#6366f1",
  },
  {
    id: "anxious",
    value: "anxious",
    label: "Anxious",
    emoji: "🌀",
    description: "Racing thoughts, need clarity & small steps",
    moodScore: 4,
    energyLevel: 5,
    stressLevel: 7,
    color: "from-violet-500/20 to-rose-500/10 border-violet-500/30 text-violet-800",
    activeColor: "bg-violet-600 text-white ring-violet-400 shadow-violet-500/20",
    accent: "#8b5cf6",
  },
  {
    id: "stressed",
    value: "stressed",
    label: "Stressed",
    emoji: "🌊",
    description: "Overwhelmed, need decompression",
    moodScore: 3,
    energyLevel: 6,
    stressLevel: 8,
    color: "from-amber-500/20 to-orange-500/10 border-amber-500/30 text-amber-800",
    activeColor: "bg-amber-600 text-white ring-amber-400 shadow-amber-500/20",
    accent: "#d97706",
  },
];

export const MOOD_VALUES = MOOD_OPTIONS.map((option) => option.value);

export const PRESET_MOODS = MOOD_OPTIONS;
