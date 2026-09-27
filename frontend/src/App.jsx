import React, { useState } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import LandingPage from "./pages/LandingPage";
import Home from "./pages/Home";
import Tasks from "./pages/Tasks";
import Profile from "./pages/Profile";
import Login from "./pages/Login";
import Register from "./pages/Register";
import { MessageSquareHeart, X, Send, Sparkles } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { sendAIChatMessage } from "./redux/slices/aiSlice";

export function App() {
  const dispatch = useDispatch();
  const location = useLocation();
  const { chatMessages, loadingChat } = useSelector((state) => state.ai);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState("");

  const handleSendChat = (e) => {
    e.preventDefault();
    if (!chatInput.trim() || loadingChat) return;
    dispatch(sendAIChatMessage(chatInput.trim()));
    setChatInput("");
  };

  const isLanding = location.pathname === "/";

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-800 antialiased selection:bg-teal-100 selection:text-teal-900">
      {/* Show in-app Navbar on non-landing pages */}
      {!isLanding && <Navbar />}

      <main className="flex-1">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/dashboard" element={<Home />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </main>

      {/* Floating AI Companion Drawer (accessible across app) */}
      {!isLanding && (
        <div className="fixed bottom-6 right-6 z-40">
          {!isChatOpen ? (
            <button
              onClick={() => setIsChatOpen(true)}
              className="flex items-center gap-2 rounded-full bg-gradient-to-r from-teal-600 to-cyan-600 px-4 py-3 text-xs font-bold text-white shadow-lg shadow-teal-600/25 transition-all duration-200 hover:scale-105 hover:shadow-xl cursor-pointer"
            >
              <Sparkles className="h-4 w-4 animate-spin-slow" />
              <span>AI Companion</span>
            </button>
          ) : (
            <div className="relative flex h-[480px] w-[350px] sm:w-[380px] flex-col rounded-3xl border border-slate-200/90 bg-white/95 shadow-2xl backdrop-blur-md animate-in slide-in-from-bottom-4 duration-300">
              {/* Companion Header */}
              <div className="flex items-center justify-between border-b border-slate-100 p-4">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-teal-100 text-teal-700">
                    <MessageSquareHeart className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">Mindful AI Companion</h4>
                    <span className="flex items-center gap-1 text-[10px] text-teal-600">
                      <span className="h-1.5 w-1.5 rounded-full bg-teal-500"></span>
                      Calm & Listening
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setIsChatOpen(false)}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Messages Thread */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {chatMessages.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed ${
                        msg.sender === "user"
                          ? "bg-teal-600 text-white rounded-br-xs"
                          : "bg-slate-100 text-slate-800 rounded-bl-xs border border-slate-200/60"
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))}
                {loadingChat && (
                  <div className="flex justify-start">
                    <div className="rounded-2xl bg-slate-100 p-3 text-xs text-slate-500 italic">
                      AI is thinking with care...
                    </div>
                  </div>
                )}
              </div>

              {/* Input Bar */}
              <form onSubmit={handleSendChat} className="border-t border-slate-100 p-3 flex gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Ask about managing your energy..."
                  className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 focus:border-teal-500 focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={!chatInput.trim() || loadingChat}
                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-600 text-white hover:bg-teal-700 disabled:opacity-40 transition cursor-pointer"
                >
                  <Send className="h-3.5 w-3.5" />
                </button>
              </form>
            </div>
          )}
        </div>
      )}

      {/* In-app footer */}
      {!isLanding && (
        <footer className="border-t border-slate-200/80 bg-white py-6 text-center text-xs text-slate-400">
          <p>AI Life Manager — Productivity attuned to your mental wellbeing.</p>
        </footer>
      )}
    </div>
  );
}

export default App;
