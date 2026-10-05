import logger from "../../utils/Logger.js";
import { getTemperatureConfig } from "./temperature.service.js";
import {
  dailySuggestionPrompt,
  moodAnalysisPrompt,
  taskPrioritizationPrompt,
  quickChatPrompt,
  buildContextExtractionPrompt,
} from "./promptTemplet.js";

/** Per-provider fetch timeout — prevents one slow provider from blocking fallback/fanout */
const PROVIDER_TIMEOUT_MS = 10000;

/** Default AI mode: 'fallback' | 'fanout' */
export const AI_MODE = process.env.AI_MODE || "fallback";

/**
 * Parses and extracts JSON object safely from raw text or markdown fence
 */
export const extractAndParseJSON = (text) => {
  if (!text || typeof text !== "string") return null;
  const cleaned = text
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```\s*$/i, "")
    .trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        return JSON.parse(match[0]);
      } catch {
        return null;
      }
    }
    return null;
  }
};

/**
 * Validates the parsed JSON shape for a DayPlan:
 * Required: summary (string), focusTasks (array), wellnessActivities (array), notes (string)
 */
export const validateDayPlanShape = (data) => {
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    return false;
  }
  if (typeof data.summary !== "string" || !data.summary.trim()) {
    return false;
  }
  if (!Array.isArray(data.focusTasks)) {
    return false;
  }
  if (!Array.isArray(data.wellnessActivities)) {
    return false;
  }
  if (data.notes !== undefined && typeof data.notes !== "string") {
    return false;
  }
  return true;
};

/**
 * Configurable provider order (default: Gemini, Mistral, Cohere)
 */
export const getProviderOrder = () => {
  const envOrder = process.env.AI_PROVIDER_ORDER;
  if (envOrder) {
    const parsed = envOrder
      .split(",")
      .map((p) => p.trim().toLowerCase())
      .filter((p) => ["gemini", "mistral", "cohere"].includes(p));
    if (parsed.length > 0) return parsed;
  }
  return ["gemini", "mistral", "cohere"];
};

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
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), PROVIDER_TIMEOUT_MS);
  try {
    const apiKey =
      process.env.GOOGLE_API_KEY ||
      process.env.GEMINI_API_KEY ||
      process.env.GEMNI_API;
    if (!apiKey) throw new Error("Gemini API key not configured");

    const model =
      process.env.GEMINI_MODEL ||
      process.env.GOOGLE_MODEL ||
      "gemini-2.0-flash";

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        signal: controller.signal,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature,
            maxOutputTokens: Math.max(maxTokens, 512),
          },
        }),
      },
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
    const msg =
      err.name === "AbortError"
        ? `Gemini timeout (>${PROVIDER_TIMEOUT_MS}ms)`
        : err.message;
    logger.warn(`[AI] Gemini failed: ${msg}`);
    return {
      provider: "gemini",
      text: null,
      duration: Date.now() - start,
      error: msg,
    };
  } finally {
    clearTimeout(timer);
  }
};

/**
 * Provider 2: Mistral AI
 */
const callMistral = async (prompt, temperature = 0.7, maxTokens = 1024) => {
  const start = Date.now();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), PROVIDER_TIMEOUT_MS);
  try {
    const apiKey = process.env.MISTRALAI_API_KEY;
    if (!apiKey) throw new Error("Mistral API key not configured");

    const response = await fetch("https://api.mistral.ai/v1/chat/completions", {
      method: "POST",
      signal: controller.signal,
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
        data?.message || data?.error?.message || "Mistral API error",
      );

    const text = data?.choices?.[0]?.message?.content || "";
    return {
      provider: "mistral",
      text: text.trim(),
      duration: Date.now() - start,
      error: null,
    };
  } catch (err) {
    const msg =
      err.name === "AbortError"
        ? `Mistral timeout (>${PROVIDER_TIMEOUT_MS}ms)`
        : err.message;
    logger.warn(`[AI] Mistral failed: ${msg}`);
    return {
      provider: "mistral",
      text: null,
      duration: Date.now() - start,
      error: msg,
    };
  } finally {
    clearTimeout(timer);
  }
};

/**
 * Provider 3: Cohere
 */
const callCohere = async (prompt, temperature = 0.7, maxTokens = 1024) => {
  const start = Date.now();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), PROVIDER_TIMEOUT_MS);
  try {
    const apiKey = process.env.COHERE_API_KEY;
    if (!apiKey) throw new Error("Cohere API key not configured");

    const response = await fetch("https://api.cohere.com/v2/chat", {
      method: "POST",
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        "X-Client-Name": "ai-life-manager",
      },
      body: JSON.stringify({
        model: "command-a-03-2025",
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
    const msg =
      err.name === "AbortError"
        ? `Cohere timeout (>${PROVIDER_TIMEOUT_MS}ms)`
        : err.message;
    logger.warn(`[AI] Cohere failed: ${msg}`);
    return {
      provider: "cohere",
      text: null,
      duration: Date.now() - start,
      error: msg,
    };
  } finally {
    clearTimeout(timer);
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

const providerCallers = {
  gemini: callGemini,
  mistral: callMistral,
  cohere: callCohere,
};

/**
 * ============================================================
 * ORCHESTRATOR MODE 1: Fallback Runner
 * ============================================================
 * Sequentially tries providers in configurable order (default: Gemini, Mistral, Cohere).
 * Advances to next provider only if call throws, times out, or fails schema validation.
 * Stops at first valid result. Returns { data, providerUsed, latencyMs }.
 * ============================================================
 */
export const executeFallback = async (
  prompt,
  temperature = 0.7,
  maxTokens = 1024,
  schemaValidator = null
) => {
  const order = getProviderOrder();
  const errors = [];
  const start = Date.now();

  for (const providerName of order) {
    const caller = providerCallers[providerName];
    if (!caller) continue;

    logger.info(`[AI Orchestrator: Fallback] Trying provider '${providerName}'...`);
    try {
      const result = await caller(prompt, temperature, maxTokens);
      if (result.error || !result.text) {
        const errMsg = result.error || "Empty response";
        errors.push(`${providerName}: ${errMsg}`);
        logger.warn(`[AI Orchestrator: Fallback] ${providerName} unavailable: ${errMsg}`);
        continue;
      }

      let parsedData = result.text;
      if (schemaValidator) {
        const parsedJson = extractAndParseJSON(result.text);
        if (!parsedJson || !schemaValidator(parsedJson)) {
          const validationErr = `${providerName}: Response failed schema validation`;
          errors.push(validationErr);
          logger.warn(`[AI Orchestrator: Fallback] ${validationErr}`);
          continue;
        }
        parsedData = parsedJson;
      }

      const latencyMs = Date.now() - start;
      logger.info(
        `[AI Orchestrator: Fallback] Success with provider '${providerName}' (${latencyMs}ms)`
      );

      return {
        data: parsedData,
        providerUsed: result.provider,
        latencyMs,
        // Backwards-compatibility fields
        text: result.text,
        provider: result.provider,
        duration: result.duration,
      };
    } catch (err) {
      errors.push(`${providerName}: ${err.message}`);
      logger.warn(`[AI Orchestrator: Fallback] Error in ${providerName}: ${err.message}`);
      continue;
    }
  }

  throw new Error(`All AI fallback providers failed: ${errors.join(" | ")}`);
};

/**
 * ============================================================
 * ORCHESTRATOR MODE 2: Fan-Out Runner
 * ============================================================
 * Sends prompt to all providers in parallel, validates schema,
 * scores successful responses, and returns the highest scoring result.
 * Returns { data, providerUsed, latencyMs }.
 * ============================================================
 */
export const executeFanout = async (
  prompt,
  temperature = 0.7,
  maxTokens = 1024,
  schemaValidator = null
) => {
  const start = Date.now();
  logger.debug("[AI Orchestrator: Fanout] Sending to all providers in parallel...");

  const [geminiResult, mistralResult, cohereResult] = await Promise.all([
    callGemini(prompt, temperature, maxTokens),
    callMistral(prompt, temperature, maxTokens),
    callCohere(prompt, temperature, maxTokens),
  ]);

  const results = [geminiResult, mistralResult, cohereResult];

  logger.debug(
    `[AI Orchestrator: Fanout] Durations — Gemini: ${geminiResult.duration}ms | Mistral: ${mistralResult.duration}ms | Cohere: ${cohereResult.duration}ms`
  );

  const scored = results.map((r) => {
    let valid = !r.error && !!r.text;
    let parsed = null;
    if (valid && schemaValidator) {
      parsed = extractAndParseJSON(r.text);
      if (!parsed || !schemaValidator(parsed)) {
        valid = false;
      }
    }
    return {
      ...r,
      parsed,
      valid,
      score: valid ? scoreResponse(r) : 0,
    };
  });

  const successful = scored.filter((r) => r.valid);
  if (successful.length === 0) {
    throw new Error(
      "All AI providers failed: " +
        results
          .map((r) => r.error || (r.text ? "Failed schema validation" : "No text"))
          .join(" | ")
    );
  }

  const best = successful.sort((a, b) => b.score - a.score)[0];
  const latencyMs = Date.now() - start;

  logger.info(
    `[AI Orchestrator: Fanout] Winner: ${best.provider} (score: ${best.score.toFixed(1)}, ${best.duration}ms)`
  );

  return {
    data: best.parsed !== null ? best.parsed : best.text,
    providerUsed: best.provider,
    latencyMs,
    text: best.text,
    provider: best.provider,
    duration: best.duration,
    allProviders: scored.map(({ provider, duration, score, error, valid }) => ({
      provider,
      duration,
      score: parseFloat(score.toFixed(1)),
      success: valid,
      error: error || (valid ? null : "Schema validation failed"),
    })),
  };
};

/**
 * Main AI Orchestrator Dispatcher:
 * Switches between 'fallback' and 'fanout' based on AI_MODE env var.
 */
export const runAIOrchestrator = async (
  prompt,
  temperature = 0.7,
  maxTokens = 1024,
  schemaValidator = null
) => {
  const mode = (process.env.AI_MODE || "fallback").toLowerCase().trim();
  if (mode === "fanout") {
    return executeFanout(prompt, temperature, maxTokens, schemaValidator);
  }
  return executeFallback(prompt, temperature, maxTokens, schemaValidator);
};

/** Backwards-compatible export for fanout */
export const sendToAllProviders = async (
  prompt,
  temperature = 0.7,
  maxTokens = 1024
) => {
  return executeFanout(prompt, temperature, maxTokens, null);
};

/**
 * ============================================================
 * HIGH-LEVEL AI ACTIONS
 * ============================================================
 */

/**
 * Generate a personalized daily plan based on mood + tasks
 * Uses schema validation for { summary, focusTasks, wellnessActivities, notes }
 */
export const generateDailySuggestion = async ({ user, moodCheckIn, tasks }) => {
  const { temperature, maxTokens } = getTemperatureConfig(
    "daily_suggestion",
    moodCheckIn
  );
  const prompt = dailySuggestionPrompt({ user, moodCheckIn, tasks });
  return runAIOrchestrator(prompt, temperature, maxTokens, validateDayPlanShape);
};

/**
 * Analyze mood patterns and return wellness insights
 */
export const analyzeMoodPatterns = async ({ user, analytics }) => {
  const { temperature, maxTokens } = getTemperatureConfig("mood_analysis");
  const prompt = moodAnalysisPrompt({ user, analytics });
  return runAIOrchestrator(prompt, temperature, maxTokens);
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
  return runAIOrchestrator(prompt, temperature, maxTokens);
};

/**
 * Free-form chat with the AI Life Manager
 */
export const quickChat = async ({ user, message }) => {
  const { temperature, maxTokens } = getTemperatureConfig("quick_chat");
  const prompt = quickChatPrompt({ user, message });
  return runAIOrchestrator(prompt, temperature, maxTokens);
};

/**
 * Extract a short productivity-relevant context summary from a free-text mood note.
 * Uses low temperature (0.2) for consistency.
 * Never throws — returns empty string on any failure so the calling check-in always succeeds.
 *
 * @param {string} note - raw free-text mood note
 * @returns {Promise<string>} derivedContext phrase or empty string
 */
export const getDerivedContext = async (note) => {
  if (!note || !note.trim()) return "";
  try {
    const { system, user } = buildContextExtractionPrompt(note.trim());
    // Combine system + user prompt into a single string the orchestrator can send
    const combinedPrompt = `${system}\n\n${user}`;
    const result = await executeFallback(combinedPrompt, 0.2, 150);
    const raw = result.data || result.text || "";
    // result.data may already be parsed; if not, parse it
    let parsed;
    if (typeof raw === "object" && raw !== null) {
      parsed = raw;
    } else {
      try {
        const cleaned = String(raw)
          .replace(/^```json\s*/i, "")
          .replace(/^```\s*/i, "")
          .replace(/```\s*$/i, "")
          .trim();
        parsed = JSON.parse(cleaned);
      } catch {
        return "";
      }
    }
    return typeof parsed?.derivedContext === "string"
      ? parsed.derivedContext.trim().slice(0, 200)
      : "";
  } catch (err) {
    logger.warn(`[AI] getDerivedContext failed (non-blocking): ${err.message}`);
    return "";
  }
};

export default {
  AI_MODE,
  getProviderOrder,
  validateDayPlanShape,
  extractAndParseJSON,
  executeFallback,
  executeFanout,
  runAIOrchestrator,
  sendToAllProviders,
  generateDailySuggestion,
  analyzeMoodPatterns,
  prioritizeTasks,
  quickChat,
  getDerivedContext,
};
