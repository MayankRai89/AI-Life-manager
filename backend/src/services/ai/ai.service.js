import logger from "../../utils/Logger.js";
import { getTemperatureConfig } from "./temperature.service.js";
import {
  dailySuggestionPrompt,
  moodAnalysisPrompt,
  taskPrioritizationPrompt,
  quickChatPrompt,
} from "./promptTemplet.js";

/**
 * ============================================================
 * AI PROVIDER ADAPTERS
 * ============================================================
 * Each adapter wraps a different AI provider API and returns
 * a normalized response with: { text, provider, duration, error }
 * ============================================================
 */

/**
 * Provider 1: Google Gemini
 */
const callGemini = async (prompt, temperature = 0.7, maxTokens = 1024) => {
  const start = Date.now();
  try {
    const apiKey = process.env.GEMNI_API;
    if (!apiKey) throw new Error("Gemini API key not configured");

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature, maxOutputTokens: maxTokens },
        }),
      }
    );

    const data = await response.json();
    if (!response.ok)
      throw new Error(data?.error?.message || "Gemini API error");

    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
    return {
      provider: "gemini",
      text: text.trim(),
      duration: Date.now() - start,
      error: null,
    };
  } catch (err) {
    logger.warn(`[AI] Gemini failed: ${err.message}`);
    return {
      provider: "gemini",
      text: null,
      duration: Date.now() - start,
      error: err.message,
    };
  }
};

/**
 * Provider 2: Mistral AI
 */
const callMistral = async (prompt, temperature = 0.7, maxTokens = 1024) => {
  const start = Date.now();
  try {
    const apiKey = process.env.MISTRALAI_API_KEY;
    if (!apiKey) throw new Error("Mistral API key not configured");

    const response = await fetch("https://api.mistral.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "mistral-small-latest",
        messages: [{ role: "user", content: prompt }],
        temperature,
        max_tokens: maxTokens,
      }),
    });

    const data = await response.json();
    if (!response.ok)
      throw new Error(
        data?.message || data?.error?.message || "Mistral API error"
      );

    const text = data?.choices?.[0]?.message?.content || "";
    return {
      provider: "mistral",
      text: text.trim(),
      duration: Date.now() - start,
      error: null,
    };
  } catch (err) {
    logger.warn(`[AI] Mistral failed: ${err.message}`);
    return {
      provider: "mistral",
      text: null,
      duration: Date.now() - start,
      error: err.message,
    };
  }
};

/**
 * Provider 3: Cohere
 */
const callCohere = async (prompt, temperature = 0.7, maxTokens = 1024) => {
  const start = Date.now();
  try {
    const apiKey = process.env.COHERE_API_KEY;
    if (!apiKey) throw new Error("Cohere API key not configured");

    const response = await fetch("https://api.cohere.com/v2/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        "X-Client-Name": "ai-life-manager",
      },
      body: JSON.stringify({
        model: "command-r-plus",
        messages: [{ role: "user", content: prompt }],
        temperature,
        max_tokens: maxTokens,
      }),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data?.message || "Cohere API error");

    const text = data?.message?.content?.[0]?.text || "";
    return {
      provider: "cohere",
      text: text.trim(),
      duration: Date.now() - start,
      error: null,
    };
  } catch (err) {
    logger.warn(`[AI] Cohere failed: ${err.message}`);
    return {
      provider: "cohere",
      text: null,
      duration: Date.now() - start,
      error: err.message,
    };
  }
};

/**
 * ============================================================
 * RESPONSE SCORER
 * ============================================================
 * Scores each provider response by quality, structure, and speed.
 * Returns a numeric score used to pick the best response.
 * ============================================================
 */
const scoreResponse = (result) => {
  if (!result || result.error || !result.text) return 0;

  let score = 0;
  const wordCount = result.text.split(/\s+/).length;

  // Quality: reward detailed responses (max 40 pts)
  score += Math.min(wordCount / 10, 40);

  // Structure: reward organized content with lists / headings
  const hasStructure =
    result.text.includes("\n") ||
    result.text.includes("•") ||
    result.text.includes("**") ||
    result.text.includes("-") ||
    /\d\./.test(result.text);
  if (hasStructure) score += 20;

  // Speed: penalize slow responses (ideal < 2s, max penalty -30)
  const speedPenalty = Math.max(0, (result.duration - 2000) / 100);
  score -= Math.min(speedPenalty, 30);

  // Penalize very short / incomplete responses
  if (wordCount < 10) score -= 20;

  return Math.max(0, score);
};

/**
 * ============================================================
 * CORE: Send to All Providers (Multi-Provider Fan-Out)
 * ============================================================
 * Step 1: Send the same prompt to Gemini + Mistral + Cohere in parallel
 * Step 2: Score each response (quality, structure, speed)
 * Step 3: Return the best result + metadata about all providers
 * ============================================================
 *
 * @param {string} prompt
 * @param {number} temperature
 * @param {number} maxTokens
 * @returns {Promise<{ text, provider, duration, allProviders }>}
 */
export const sendToAllProviders = async (
  prompt,
  temperature = 0.7,
  maxTokens = 1024
) => {
  logger.debug("[AI] Sending to all 3 providers in parallel...");

  const [geminiResult, mistralResult, cohereResult] = await Promise.all([
    callGemini(prompt, temperature, maxTokens),
    callMistral(prompt, temperature, maxTokens),
    callCohere(prompt, temperature, maxTokens),
  ]);

  const results = [geminiResult, mistralResult, cohereResult];

  logger.debug(
    `[AI] Durations — Gemini: ${geminiResult.duration}ms | Mistral: ${mistralResult.duration}ms | Cohere: ${cohereResult.duration}ms`
  );

  const scored = results.map((r) => ({ ...r, score: scoreResponse(r) }));

  const successful = scored.filter((r) => !r.error && r.text);
  if (successful.length === 0) {
    throw new Error(
      "All AI providers failed: " + results.map((r) => r.error).join(" | ")
    );
  }

  const best = successful.sort((a, b) => b.score - a.score)[0];

  logger.info(
    `[AI] Winner: ${best.provider} (score: ${best.score.toFixed(1)}, ${best.duration}ms)`
  );

  return {
    text: best.text,
    provider: best.provider,
    duration: best.duration,
    allProviders: scored.map(({ provider, duration, score, error }) => ({
      provider,
      duration,
      score: parseFloat(score.toFixed(1)),
      success: !error,
      error: error || null,
    })),
  };
};

/**
 * ============================================================
 * HIGH-LEVEL AI ACTIONS
 * These functions build the prompt + get temperature config,
 * then fan out to all providers and return the best result.
 * ============================================================
 */

/**
 * Generate a personalized daily plan based on mood + tasks
 */
export const generateDailySuggestion = async ({ user, moodCheckIn, tasks }) => {
  const { temperature, maxTokens } = getTemperatureConfig(
    "daily_suggestion",
    moodCheckIn
  );
  const prompt = dailySuggestionPrompt({ user, moodCheckIn, tasks });
  return sendToAllProviders(prompt, temperature, maxTokens);
};

/**
 * Analyze mood patterns and return wellness insights
 */
export const analyzeMoodPatterns = async ({ user, analytics }) => {
  const { temperature, maxTokens } = getTemperatureConfig("mood_analysis");
  const prompt = moodAnalysisPrompt({ user, analytics });
  return sendToAllProviders(prompt, temperature, maxTokens);
};

/**
 * Smart task ranking based on current mental state
 */
export const prioritizeTasks = async ({ user, moodCheckIn, tasks }) => {
  const { temperature, maxTokens } = getTemperatureConfig(
    "task_prioritization",
    moodCheckIn
  );
  const prompt = taskPrioritizationPrompt({ user, moodCheckIn, tasks });
  return sendToAllProviders(prompt, temperature, maxTokens);
};

/**
 * Free-form chat with the AI Life Manager
 */
export const quickChat = async ({ user, message }) => {
  const { temperature, maxTokens } = getTemperatureConfig("quick_chat");
  const prompt = quickChatPrompt({ user, message });
  return sendToAllProviders(prompt, temperature, maxTokens);
};

export default {
  sendToAllProviders,
  generateDailySuggestion,
  analyzeMoodPatterns,
  prioritizeTasks,
  quickChat,
};
