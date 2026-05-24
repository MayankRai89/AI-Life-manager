import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import api from "../api";
import TodoList from "../components/TodoList";
import {
  LogOut,
  CheckCircle2,
  Circle,
  Sparkles,
  Plus,
  Home,
  BarChart2,
  Book,
  Settings,
  Mic,
  Headphones,
  Play,
  SkipForward,
  SkipBack,
  Sun,
  Brain,
  Coffee,
  BookOpen,
  Moon,
  Wind,
} from "lucide-react";

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [tasks, setTasks] = useState([]);

  // Fake state for UI demonstration
  const [activeTab, setActiveTab] = useState("Today");

  // Voice Input State
  const [isListening, setIsListening] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [aiMessage, setAiMessage] = useState(
    "I'm here to understand you, guide you, and help you become your best self. Let's make today meaningful.",
  );

  // AI Day Planner State
  const [mood, setMood] = useState("neutral");
  const [moodScore, setMoodScore] = useState(7);
  const [loadingPlan, setLoadingPlan] = useState(false);
  const [suggestedTasks, setSuggestedTasks] = useState([]);
  const [showPlanModal, setShowPlanModal] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  const fetchData = useCallback(async () => {
    try {
      const [userRes, tasksRes] = await Promise.all([
        api.get("/auth/me"),
        api.get("/tasks/"),
      ]);
      setUser(userRes.data);
      setTasks(tasksRes.data);
    } catch (err) {
      console.error(err);
      if (err.response?.status === 401) {
        handleLogout();
      }
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
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
        "Analyzing your mood and generating a personalized day plan...",
      );
      const res = await api.post("/ai/day-plan", {
        mood,
        mood_score: moodScore,
        note: chatInput,
      });
      const planMsg = res.data.plan_message;
      setAiMessage(planMsg);
      setSuggestedTasks(res.data.suggested_tasks || []);

      // If there are suggested tasks, show the modal
      if (res.data.suggested_tasks && res.data.suggested_tasks.length > 0) {
        setShowPlanModal(true);
      }

      // Speak a brief confirmation instead of the whole plan to avoid endless speaking
      const synth = window.speechSynthesis;
      const utterance = new SpeechSynthesisUtterance(
        "I have created your personalized day plan based on how you feel.",
      );
      utterance.pitch = 1.1;
      synth.speak(utterance);

      // We don't fetchData here anymore because tasks aren't saved yet!
    } catch (err) {
      console.error("Failed to generate plan", err);
      setAiMessage("Sorry, I encountered an error while planning your day.");
    } finally {
      setLoadingPlan(false);
    }
  };

  const handleSavePlan = async () => {
    try {
      setLoadingPlan(true);
      await api.post("/ai/save-plan", { tasks: suggestedTasks });
      setShowPlanModal(false);
      fetchData(); // Refresh the main to-do list
      setAiMessage("Your new tasks have been added to your To-Do list!");
    } catch (err) {
      console.error(err);
      alert("Failed to save plan");
    } finally {
      setLoadingPlan(false);
    }
  };

  const handleChatSubmit = (e) => {
    if (e.key === "Enter" && chatInput.trim()) {
      // Mock sending message
      setChatInput("");
      const reply =
        "I heard you! I'm still learning to process complex thoughts, but I'm here for you.";
      setAiMessage(reply);

      // Text-to-Speech Output
      const synth = window.speechSynthesis;
      const utterance = new SpeechSynthesisUtterance(reply);
      utterance.pitch = 1.1; // Slightly futuristic/higher pitch
      synth.speak(utterance);
    }
  };

  return (
    <>
      <div className="ai-background"></div>
      <div className="ai-background-overlay"></div>

      <div className="dashboard-layout">
        {/* Header */}
        <header
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "24px",
            zIndex: 10,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Sparkles size={24} color="var(--accent-purple)" />
            <h1
              style={{ fontSize: "1.25rem", fontWeight: "600" }}
              className="glow-text"
            >
              AI Life Manager
            </h1>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <span
              style={{ fontSize: "0.9rem", color: "var(--text-secondary)" }}
            >
              {user?.email || "Loading..."}
            </span>
            <button
              onClick={handleLogout}
              className="btn-icon"
              style={{ padding: "8px 16px", gap: "8px", fontSize: "0.9rem" }}
            >
              <LogOut size={16} /> Logout
            </button>
          </div>
        </header>

        {/* Main 3-Column Layout */}
        <main className="dashboard-main">
          {/* Left Panel: AI Companion */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            style={{ display: "flex", flexDirection: "column", gap: "24px" }}
          >
            <div
              className="glass-panel"
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                gap: "24px",
              }}
            >
              <div>
                <h2
                  style={{
                    fontSize: "1.1rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    marginBottom: "8px",
                  }}
                >
                  <Sparkles size={18} color="var(--accent-purple)" /> AI
                  Companion
                </h2>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    fontSize: "0.8rem",
                    color: "var(--success)",
                  }}
                >
                  <div
                    style={{
                      width: "8px",
                      height: "8px",
                      borderRadius: "50%",
                      background: "var(--success)",
                      boxShadow: "0 0 8px var(--success)",
                    }}
                  ></div>
                  Online
                </div>
              </div>

              <p
                style={{
                  color: "var(--text-primary)",
                  lineHeight: "1.6",
                  fontSize: "0.95rem",
                }}
              >
                {aiMessage}
              </p>

              <div
                style={{
                  border: "1px solid var(--border-glass)",
                  borderRadius: "12px",
                  padding: "16px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "16px",
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: "0.8rem",
                      color: "var(--text-secondary)",
                      marginBottom: "8px",
                      display: "flex",
                      justifyContent: "space-between",
                    }}
                  >
                    <span>Mood Detected</span>
                    <span>{mood}</span>
                  </div>
                  <div
                    style={{ display: "flex", gap: "8px", fontSize: "0.9rem" }}
                  >
                    {["tired", "neutral", "great"].map((m) => (
                      <button
                        key={m}
                        onClick={() => setMood(m)}
                        className="btn-icon"
                        style={{
                          flex: 1,
                          padding: "4px",
                          fontSize: "0.8rem",
                          background:
                            mood === m
                              ? "rgba(139, 92, 246, 0.3)"
                              : "transparent",
                          borderColor:
                            mood === m
                              ? "var(--accent-purple)"
                              : "var(--border-glass)",
                        }}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <div
                    style={{
                      fontSize: "0.8rem",
                      color: "var(--text-secondary)",
                      marginBottom: "8px",
                      display: "flex",
                      justifyContent: "space-between",
                    }}
                  >
                    <span>Energy Level</span>
                    <span>{moodScore}/10</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={moodScore}
                    onChange={(e) => setMoodScore(parseInt(e.target.value))}
                    style={{ width: "100%" }}
                  />
                </div>

                <button
                  onClick={generateDayPlan}
                  disabled={loadingPlan}
                  className="btn-icon"
                  style={{
                    width: "100%",
                    padding: "8px",
                    background: "var(--accent-purple)",
                    color: "white",
                    border: "none",
                  }}
                >
                  {loadingPlan ? "Processing..." : "Plan My Day 🧠"}
                </button>
              </div>

              <div style={{ marginTop: "auto", position: "relative" }}>
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={handleChatSubmit}
                  placeholder="Talk to me... (Press Enter to send)"
                  style={{
                    width: "100%",
                    background: "transparent",
                    border: "none",
                    borderBottom: "1px solid var(--border-glass)",
                    borderRadius: 0,
                    paddingLeft: 0,
                    paddingRight: "40px",
                    color: "var(--text-primary)",
                  }}
                />
                <button
                  onClick={toggleListening}
                  className="btn-icon"
                  style={{
                    position: "absolute",
                    right: 0,
                    top: "50%",
                    transform: "translateY(-50%)",
                    border: "none",
                    background: isListening
                      ? "rgba(239, 68, 68, 0.8)"
                      : "var(--accent-purple)",
                    color: "white",
                    borderRadius: "50%",
                    padding: "8px",
                    boxShadow: isListening
                      ? "0 0 15px rgba(239, 68, 68, 0.8)"
                      : "none",
                    transition: "all 0.3s",
                  }}
                >
                  <Mic size={16} />
                </button>
              </div>
            </div>

            {/* Music Player */}
            <div
              className="glass-panel"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "16px 24px",
              }}
            >
              <div
                style={{ display: "flex", alignItems: "center", gap: "12px" }}
              >
                <Headphones size={20} color="var(--text-secondary)" />
                <div>
                  <div style={{ fontSize: "0.8rem", fontWeight: "bold" }}>
                    Focus Mode
                  </div>
                  <div
                    style={{
                      fontSize: "0.75rem",
                      color: "var(--text-secondary)",
                    }}
                  >
                    Lo-fi Beats
                  </div>
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "16px",
                  color: "var(--text-primary)",
                }}
              >
                <SkipBack size={16} style={{ cursor: "pointer" }} />
                <Play size={16} style={{ cursor: "pointer" }} />
                <SkipForward size={16} style={{ cursor: "pointer" }} />
              </div>
            </div>
          </motion.div>

          {/* Center: AI Face & Greeting */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="dashboard-center"
          >
            <div
              className="glass-panel floating"
              style={{
                maxWidth: "450px",
                width: "100%",
                padding: "24px",
                display: "flex",
                flexDirection: "column",
                gap: "8px",
              }}
            >
              <h2
                style={{
                  fontSize: "1.4rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <Sparkles size={20} color="var(--accent-purple)" />
                Good evening, {user?.name || "User"} 🌙
              </h2>
              <p style={{ color: "var(--text-secondary)", marginLeft: "28px" }}>
                How can I help you grow today?
              </p>
            </div>
          </motion.div>

          {/* Right Panel: Tasks */}
          <TodoList
            tasks={tasks}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            toggleTaskStatus={toggleTaskStatus}
          />
        </main>

        {/* Edit Plan Modal */}
        {showPlanModal && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "rgba(0,0,0,0.7)",
              backdropFilter: "blur(10px)",
              zIndex: 100,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              className="glass-panel"
              style={{
                width: "90%",
                maxWidth: "500px",
                maxHeight: "80vh",
                overflowY: "auto",
                padding: "24px",
                display: "flex",
                flexDirection: "column",
                gap: "16px",
              }}
            >
              <h2
                style={{
                  fontSize: "1.2rem",
                  color: "var(--accent-purple)",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <Sparkles size={20} /> Edit AI Day Plan
              </h2>
              <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)" }}>
                Review the generated tasks and edit their titles or timings
                before saving to your To-Do list.
              </p>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                }}
              >
                {suggestedTasks.map((t, idx) => (
                  <div
                    key={idx}
                    style={{
                      background: "rgba(255,255,255,0.05)",
                      padding: "12px",
                      borderRadius: "8px",
                      border: "1px solid var(--border-glass)",
                    }}
                  >
                    <input
                      type="text"
                      value={t.title}
                      onChange={(e) => {
                        const newTasks = [...suggestedTasks];
                        newTasks[idx].title = e.target.value;
                        setSuggestedTasks(newTasks);
                      }}
                      style={{
                        width: "100%",
                        background: "transparent",
                        border: "none",
                        borderBottom: "1px solid rgba(255,255,255,0.2)",
                        color: "var(--text-primary)",
                        marginBottom: "8px",
                        paddingBottom: "4px",
                      }}
                    />
                    <div style={{ display: "flex", gap: "8px" }}>
                      <input
                        type="text"
                        value={t.estimated_time}
                        onChange={(e) => {
                          const newTasks = [...suggestedTasks];
                          newTasks[idx].estimated_time = e.target.value;
                          setSuggestedTasks(newTasks);
                        }}
                        style={{
                          flex: 1,
                          background: "rgba(0,0,0,0.2)",
                          border: "none",
                          borderRadius: "4px",
                          padding: "4px 8px",
                          color: "var(--accent-cyan)",
                          fontSize: "0.85rem",
                        }}
                      />
                      <button
                        onClick={() => {
                          const newTasks = [...suggestedTasks];
                          newTasks.splice(idx, 1);
                          setSuggestedTasks(newTasks);
                        }}
                        style={{
                          background: "rgba(239, 68, 68, 0.2)",
                          color: "#ef4444",
                          border: "none",
                          borderRadius: "4px",
                          padding: "4px 8px",
                          cursor: "pointer",
                        }}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={() =>
                  setSuggestedTasks([
                    ...suggestedTasks,
                    {
                      title: "New Task",
                      estimated_time: "Anytime",
                      description: "",
                      energy_required: "medium",
                    },
                  ])
                }
                style={{
                  background: "transparent",
                  border: "1px dashed var(--accent-purple)",
                  color: "var(--accent-purple)",
                  padding: "8px",
                  borderRadius: "8px",
                  cursor: "pointer",
                }}
              >
                + Add Custom Task
              </button>

              <div style={{ display: "flex", gap: "12px", marginTop: "12px" }}>
                <button
                  onClick={() => setShowPlanModal(false)}
                  style={{
                    flex: 1,
                    padding: "10px",
                    background: "rgba(255,255,255,0.1)",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSavePlan}
                  style={{
                    flex: 1,
                    padding: "10px",
                    background: "var(--accent-purple)",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    cursor: "pointer",
                  }}
                >
                  {loadingPlan ? "Saving..." : "Save to To-Do List"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Bottom Navigation */}
        <motion.nav
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="bottom-nav"
          style={{
            position: "fixed",
            bottom: "24px",
            left: "50%",
            transform: "translateX(-50%)",
            display: "flex",
            alignItems: "center",
            gap: "32px",
            background: "var(--bg-panel)",
            padding: "8px 32px",
            borderRadius: "40px",
            backdropFilter: "blur(20px)",
            border: "1px solid var(--border-glass)",
            zIndex: 10,
          }}
        >
          <div className="nav-item active">
            <Home size={20} /> Home
          </div>
          <div className="nav-item">
            <BarChart2 size={20} /> Insights
          </div>

          <div style={{ position: "relative", top: "-16px" }}>
            <div className="nav-orb">
              <Sparkles size={24} color="white" />
            </div>
          </div>

          <div className="nav-item">
            <Book size={20} /> Journal
          </div>
          <div className="nav-item">
            <Settings size={20} /> Settings
          </div>
        </motion.nav>
      </div>
    </>
  );
};

export default Dashboard;
