import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import api from "../api";
import TodoList from "../components/TodoList";
import MoodSongRecommender from "../components/MoodSongRecommender";
import MedicalReportUpload from "../components/MedicalReportUpload";
import HealthProfileWidget from "../components/HealthProfileWidget";
import {
  LogOut,
  Sparkles,
  Mic,
  Bot,
  Heart,
  Calendar,
  Music,
  Activity,
  Zap,
  Volume2,
  CheckCircle2,
  ShieldCheck,
} from "lucide-react";

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [tasks, setTasks] = useState([]);

  // Active Tab Filter for tasks
  const [activeTab, setActiveTab] = useState("Today");

  // Voice Input & AI Interaction State
  const [isListening, setIsListening] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [aiMessage, setAiMessage] = useState(
    "Hello! I am your 24/7 AI Life Assistant. I monitor your daily schedule, parse your medical reports, sync mood-based music, and optimize your routine every minute of the day.",
  );

  // AI Day Planner State
  const [mood, setMood] = useState("neutral");
  const [moodScore, setMoodScore] = useState(7);
  const [loadingPlan, setLoadingPlan] = useState(false);
  const [suggestedTasks, setSuggestedTasks] = useState([]);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [healthRefresh, setHealthRefresh] = useState(0);

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
    } catch (e) {
      console.error(e);
    }
    localStorage.removeItem("accessToken");
    window.location.href = "/login";
  };

  const fetchData = useCallback(async () => {
    try {
      const [userRes, tasksRes] = await Promise.all([
        api.get("/auth/me"),
        api.get("/tasks/"),
      ]);
      setUser(userRes.data?.data?.user || userRes.data);
      setTasks(
        Array.isArray(tasksRes.data)
          ? tasksRes.data
          : tasksRes.data?.tasks || [],
      );
    } catch (err) {
      console.error(err);
      if (err.response?.status === 401) {
        handleLogout();
      }
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const toggleTaskStatus = async (taskId, currentStatus) => {
    const newStatus = currentStatus === "done" ? "pending" : "done";
    try {
      await api.put(`/tasks/${taskId}`, { status: newStatus });
      fetchData();
    } catch (err) {
      console.error("Failed to update task", err);
    }
  };

  // Voice Recognition Handler
  const toggleListening = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice recognition is not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;

    recognition.onstart = () => setIsListening(true);

    recognition.onresult = (event) => {
      const current = event.resultIndex;
      const transcriptText = event.results[current][0].transcript;
      setChatInput(transcriptText);
    };

    recognition.onend = () => setIsListening(false);

    if (isListening) {
      recognition.stop();
    } else {
      recognition.start();
    }
  };

  const generateDayPlan = async () => {
    setLoadingPlan(true);
    try {
      setAiMessage(
        "Analyzing your mood, energy level, and health profile to generate your optimal day plan...",
      );
      const res = await api.post("/ai/day-plan", {
        mood,
        mood_score: moodScore,
        note: chatInput,
      });
      const planMsg = res.data.plan_message;
      setAiMessage(planMsg);
      setSuggestedTasks(res.data.suggested_tasks || []);

      if (res.data.suggested_tasks && res.data.suggested_tasks.length > 0) {
        setShowPlanModal(true);
      }

      const synth = window.speechSynthesis;
      const utterance = new SpeechSynthesisUtterance(
        "I have created your personalized day plan based on your current state.",
      );
      utterance.pitch = 1.1;
      synth.speak(utterance);
    } catch (err) {
      console.error("Failed to generate plan", err);
      setAiMessage("Sorry, I encountered an issue while generating your day plan.");
    } finally {
      setLoadingPlan(false);
    }
  };

  const handleSavePlan = async () => {
    try {
      setLoadingPlan(true);
      await api.post("/ai/save-plan", { tasks: suggestedTasks });
      setShowPlanModal(false);
      fetchData();
      setAiMessage("Great! I have updated your daily task schedule.");
    } catch (err) {
      console.error(err);
      alert("Failed to save plan");
    } finally {
      setLoadingPlan(false);
    }
  };

  const handleChatSubmit = (e) => {
    if (e.key === "Enter" && chatInput.trim()) {
      const userText = chatInput;
      setChatInput("");
      const reply = `I'm processing "${userText}". As your AI Personal Assistant, I'm constantly taking care of your schedule, health, and wellbeing.`;
      setAiMessage(reply);

      const synth = window.speechSynthesis;
      const utterance = new SpeechSynthesisUtterance(reply);
      utterance.pitch = 1.05;
      synth.speak(utterance);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex flex-col p-4 sm:p-6 lg:p-8">
      {/* Background AI Radial Glows */}
      <div className="ai-background" />

      {/* Header Bar */}
      <header className="max-w-7xl w-full mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 pb-6 border-b border-slate-800/80 mb-8 z-10">
        <div className="flex items-center gap-3">
          <div className="relative p-2.5 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-cyan-500 shadow-lg shadow-indigo-500/20 ai-pulse-ring">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight flex items-center gap-2">
              <span className="ai-gradient-text">AI Life Manager</span>
            </h1>
            <p className="text-xs text-slate-400 font-medium flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              24/7 Personal AI Assistant & Companion
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-slate-300">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>{user?.email || "Assistant Active"}</span>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-medium text-slate-300 hover:text-white transition-all shadow-sm"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </header>

      {/* Hero AI Assistant Control Panel */}
      <section className="max-w-7xl w-full mx-auto mb-8 z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-3xl bg-slate-900/90 border border-indigo-500/30 p-6 sm:p-8 shadow-2xl backdrop-blur-xl ai-card-glow"
        >
          {/* Subtle Accent Glow */}
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            {/* Left AI Companion Avatar & Greeting */}
            <div className="lg:col-span-7 space-y-4">
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5" /> AI Companion Online
                </span>
                <span className="text-xs text-slate-400">
                  Carefully managing your life 24/7
                </span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                Good day, <span className="ai-gradient-text">{user?.name || "Friend"}</span> 👋
              </h2>

              {/* AI Thought / Advice Card */}
              <div className="bg-slate-950/70 border border-slate-800/90 rounded-2xl p-4 sm:p-5 flex items-start gap-3 shadow-inner">
                <div className="p-2 rounded-xl bg-indigo-600/20 text-indigo-400 shrink-0 mt-0.5">
                  <Bot className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <div className="text-xs font-semibold text-indigo-300">
                    AI Personal Life Insight
                  </div>
                  <p className="text-sm text-slate-200 leading-relaxed">
                    {aiMessage}
                  </p>
                </div>
              </div>

              {/* Quick AI Voice & Chat Bar */}
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={handleChatSubmit}
                  placeholder="Ask your AI Assistant anything or speak your mind... (Press Enter)"
                  className="w-full bg-slate-950/80 border border-slate-700/80 focus:border-indigo-500 rounded-2xl py-3.5 pl-4 pr-12 text-sm text-slate-100 placeholder-slate-500 shadow-lg transition-all"
                />
                <button
                  onClick={toggleListening}
                  className={`absolute right-2 p-2.5 rounded-xl transition-all ${
                    isListening
                      ? "bg-rose-600 text-white animate-pulse shadow-lg shadow-rose-600/40"
                      : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-md"
                  }`}
                  title={isListening ? "Listening..." : "Speak to AI Assistant"}
                >
                  <Mic className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Right Mood & Energy Dials */}
            <div className="lg:col-span-5 bg-slate-950/60 border border-slate-800/80 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="text-xs font-semibold text-slate-300 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-400" /> Current State & Vitality
                </div>
                <span className="text-xs text-indigo-400 font-medium">Auto-Adapting</span>
              </div>

              {/* Mood Selector */}
              <div>
                <div className="flex justify-between text-xs text-slate-400 mb-2 font-medium">
                  <span>How are you feeling right now?</span>
                  <span className="capitalize text-indigo-300 font-semibold">{mood}</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {["tired", "neutral", "great"].map((m) => (
                    <button
                      key={m}
                      onClick={() => setMood(m)}
                      className={`py-2 px-3 rounded-xl text-xs font-semibold capitalize transition-all border ${
                        mood === m
                          ? "bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/30"
                          : "bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-800"
                      }`}
                    >
                      {m === "tired" ? "😴 Tired" : m === "neutral" ? "😐 Neutral" : "🚀 Great"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Energy Level Slider */}
              <div>
                <div className="flex justify-between text-xs text-slate-400 mb-1 font-medium">
                  <span>Energy Level</span>
                  <span className="text-cyan-400 font-bold">{moodScore}/10</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={moodScore}
                  onChange={(e) => setMoodScore(parseInt(e.target.value))}
                  className="w-full accent-indigo-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
                />
              </div>

              {/* Plan Day Button */}
              <button
                onClick={generateDayPlan}
                disabled={loadingPlan}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 hover:from-indigo-600 hover:to-cyan-600 text-white font-semibold text-sm shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4" />
                <span>{loadingPlan ? "Structuring Your Routine..." : "Generate AI Day Plan 🧠"}</span>
              </button>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Main Grid: Life Pillars (Schedule, Health, Music) */}
      <main className="max-w-7xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 z-10 flex-1">
        {/* Left Column: Tasks & Schedule (7 Cols) */}
        <section className="lg:col-span-6 space-y-6">
          <TodoList
            tasks={tasks}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            toggleTaskStatus={toggleTaskStatus}
          />
        </section>

        {/* Right Column: Medical & Health Vitals (6 Cols) */}
        <section className="lg:col-span-6 space-y-6">
          <MedicalReportUpload
            onReportUploaded={() => setHealthRefresh((prev) => prev + 1)}
          />
          <HealthProfileWidget refreshTrigger={healthRefresh} />
        </section>
      </main>

      {/* Mood & Soundtrack Companion */}
      <section className="max-w-7xl w-full mx-auto my-8 z-10">
        <MoodSongRecommender currentMood={mood} />
      </section>

      {/* Edit Plan Modal */}
      {showPlanModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-lg w-full space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-400" /> Edit AI Generated Day Plan
            </h3>
            <p className="text-xs text-slate-400">
              Review and edit the suggested tasks before adding them to your daily schedule:
            </p>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {suggestedTasks.map((t, idx) => (
                <div key={idx} className="bg-slate-950 border border-slate-800 p-3 rounded-xl flex items-center gap-3">
                  <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" />
                  <input
                    type="text"
                    value={t.title}
                    onChange={(e) => {
                      const updated = [...suggestedTasks];
                      updated[idx].title = e.target.value;
                      setSuggestedTasks(updated);
                    }}
                    className="bg-transparent text-xs text-slate-200 w-full focus:outline-none"
                  />
                </div>
              ))}
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowPlanModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-800 text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSavePlan}
                className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white shadow-lg shadow-indigo-600/30 transition-colors"
              >
                Save To Schedule
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
