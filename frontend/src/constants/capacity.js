import { Zap, Minus, Feather } from "lucide-react";

export const CAPACITY_LEVELS = ["high", "normal", "light"];

export const CAPACITY_OPTIONS = [
  {
    value: "high",
    label: "I can take on a lot",
    icon: Zap,
    iconColor: "text-emerald-600",
    selectedRing: "ring-emerald-500",
    selectedBg: "bg-emerald-50",
    selectedText: "text-emerald-800",
  },
  {
    value: "normal",
    label: "Normal day",
    icon: Minus,
    iconColor: "text-teal-600",
    selectedRing: "ring-teal-500",
    selectedBg: "bg-teal-50",
    selectedText: "text-teal-800",
  },
  {
    value: "light",
    label: "I need to keep things light",
    icon: Feather,
    iconColor: "text-violet-600",
    selectedRing: "ring-violet-400",
    selectedBg: "bg-violet-50",
    selectedText: "text-violet-800",
  },
];
