import React, { useState, useRef, useEffect } from "react";
import { Mic } from "lucide-react";

export function VoiceInputButton({ onResult, lang = "en-IN", className = "" }) {
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);

  const SpeechRecognition =
    typeof window !== "undefined" && (window.SpeechRecognition || window.webkitSpeechRecognition);

  if (!SpeechRecognition) return null;

  const toggleListening = (e) => {
    e.preventDefault();
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }
    try {
      const recognition = new SpeechRecognition();
      recognition.lang = lang;
      recognition.interimResults = false;
      recognition.continuous = false;
      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = () => setIsListening(false);
      recognition.onresult = (event) => {
        const text = event.results[0]?.[0]?.transcript?.trim();
        if (text && onResult) onResult(text);
      };
      recognitionRef.current = recognition;
      recognition.start();
    } catch {
      setIsListening(false);
    }
  };

  useEffect(() => () => recognitionRef.current?.abort(), []);

  return (
    <button
      type="button"
      onClick={toggleListening}
      title={isListening ? "Listening... click to stop" : "Speak to type"}
      aria-label={isListening ? "Listening" : "Voice input"}
      className={`inline-flex items-center gap-1 rounded-lg px-2 py-0.5 text-xs font-medium transition cursor-pointer select-none ${
        isListening
          ? "bg-rose-100 text-rose-700 animate-pulse ring-1 ring-rose-400"
          : "text-slate-400 hover:text-teal-700 hover:bg-slate-100"
      } ${className}`}
    >
      <Mic className={`h-3.5 w-3.5 ${isListening ? "text-rose-600 animate-bounce" : ""}`} />
      {isListening && <span className="text-[10px] font-semibold text-rose-600">Listening...</span>}
    </button>
  );
}

export default VoiceInputButton;
