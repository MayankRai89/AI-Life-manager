import logger from "../../utils/Logger.js";

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
const callGemini = async (prompt) => {
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
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1024,
          },
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data?.error?.message || "Gemini API error");
    }

    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
    return {
      provider: "gemini",
      text: text.trim(),
      duration: Date.now() - start,
      error: null,
    };
  } catch (err) {
    logger.warn(`Gemini failed: ${err.message}`);
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
const callMistral = async (prompt) => {
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
        temperature: 0.7,
        max_tokens: 1024,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data?.message || data?.error?.message || "Mistral API error"
      );
    }

    const text = data?.choices?.[0]?.message?.content || "";
    return {
      provider: "mistral",
      text: text.trim(),
      duration: Date.now() - start,
      error: null,
    };
  } catch (err) {
    logger.warn(`Mistral failed: ${err.message}`);
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
const callCohere = async (prompt) => {
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
        temperature: 0.7,
        max_tokens: 1024,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data?.message || "Cohere API error");
    }

    const text = data?.message?.content?.[0]?.text || "";
    return {
      provider: "cohere",
      text: text.trim(),
      duration: Date.now() - start,
      error: null,
    };
  } catch (err) {
    logger.warn(`Cohere failed: ${err.message}`);
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
 * Scores a provider response by:
 *   - Quality: length and structure of the answer
 *   - Speed: penalizes slow responses
 *   - Consistency: basic sanity checks
 * ============================================================
 */
const scoreResponse = (result) => {
  if (!result || result.error || !result.text) return 0;

  let score = 0;

  // Quality: reward longer, more detailed responses (up to a point)
  const wordCount = result.text.split(/\s+/).length;
  score += Math.min(wordCount / 10, 40); // max 40 pts for quality

  // Structure: reward responses with organized content
  const hasStructure =
    result.text.includes("\n") ||
    result.text.includes("•") ||
    result.text.includes("-") ||
    /\d\./.test(result.text);
  if (hasStructure) score += 20;

  // Speed: penalize slow responses (ideal < 2s, penalty starts at 3s)
  const speedPenalty = Math.max(0, (result.duration - 2000) / 100);
  score -= Math.min(speedPenalty, 30); // max -30 pts for speed

  // Consistency: penalize very short responses (possibly incomplete)
  if (wordCount < 10) score -= 20;

  return Math.max(0, score);
};

/**
 * ============================================================
 * MAIN MULTI-PROVIDER AI SERVICE
 * ============================================================
 * Step 1: Send the same prompt to ALL 3 providers in parallel
 * Step 2: Compare responses by quality, structure, and speed
 * Step 3: Pick the best result and return it
 * ============================================================
 */
export const sendToAllProviders = async (prompt) => {
  logger.debug("Sending AI request to all 3 providers in parallel...");

  // Step 1: Send to all 3 providers simultaneously
  const [geminiResult, mistralResult, cohereResult] = await Promise.all([
    callGemini(prompt),
    callMistral(prompt),
    callCohere(prompt),
  ]);

  const results = [geminiResult, mistralResult, cohereResult];

  logger.debug(
    `Provider durations — Gemini: ${geminiResult.duration}ms | Mistral: ${mistralResult.duration}ms | Cohere: ${cohereResult.duration}ms`
  );

  // Step 2: Score each response
  const scored = results.map((r) => ({
    ...r,
    score: scoreResponse(r),
  }));

  // Step 3: Pick the best result (highest score, must have valid text)
  const successful = scored.filter((r) => !r.error && r.text);
  if (successful.length === 0) {
    throw new Error(
      "All AI providers failed: " + results.map((r) => r.error).join(" | ")
    );
  }

  const best = successful.sort((a, b) => b.score - a.score)[0];

  logger.info(`Best AI response: ${best.provider} (score: ${best.score.toFixed(1)}, ${best.duration}ms)`);

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
 * DOMAIN-SPECIFIC PROMPT BUILDERS
 * ============================================================
 */

/**
 * Build a prompt for daily suggestions based on mood + tasks
 */
export const buildDailySuggestionPrompt = ({ user, moodCheckIn, tasks }) => {
  const { name, schedule } = user;
  const { mood, moodScore, energyLevel, stressLevel, triggers, note } =
    moodCheckIn;

  const pendingTasks = tasks
    .filter((t) => t.status === "pending" || t.status === "in_progress")
    .slice(0, 5)
    .map((t) => `- ${t.title} [${t.priority} priority, ${t.category}]`)
    .join("\n");

  return `You are an AI Life Manager assistant helping ${name} optimize their day.

## Current Mood & Wellbeing
- Mood: ${mood} (Score: ${moodScore}/10)
- Energy Level: ${energyLevel}/10
- Stress Level: ${stressLevel}/10
${triggers?.length ? `- Triggers: ${triggers.join(", ")}` : ""}
${note ? `- Personal Note: ${note}` : ""}

## Schedule
- Wake Time: ${schedule?.wakeTime || "07:00"}
- Sleep Time: ${schedule?.sleepTime || "23:00"}
- Work Hours: ${schedule?.workingHours?.start || "09:00"} - ${schedule?.workingHours?.end || "18:00"}

## Pending Tasks
${pendingTasks || "No pending tasks"}

## Your Task
Based on the user's current mood, energy, stress levels, and pending tasks:
1. Suggest the top 3 tasks they should focus on today (explain why based on their energy/mood)
2. Suggest 2 short wellness activities that match their current state
3. Give one motivational insight about their current mood pattern

Be concise, empathetic, and practical. Format with clear sections.`;
};

/**
 * Build a prompt to analyze mood patterns
 */
export const buildMoodAnalysisPrompt = ({ user, analytics }) => {
  const { name } = user;
  const { summary, moodDistribution, topTriggers } = analytics;

  return `You are an AI wellness coach analyzing mood patterns for ${name}.

## Mood Analytics (Last 30 days)
- Average Mood Score: ${summary.avgMood}/10
- Average Energy Level: ${summary.avgEnergy}/10
- Average Stress Level: ${summary.avgStress}/10
- Total Check-ins: ${summary.totalEntries}

## Mood Distribution
${Object.entries(moodDistribution)
  .map(([mood, count]) => `- ${mood}: ${count} times`)
  .join("\n")}

## Top Triggers
${topTriggers.map((t) => `- ${t.trigger}: ${t.count} occurrences`).join("\n")}

## Your Task
1. Identify the dominant mood pattern and what it suggests about life balance
2. Point out 2 positive trends to celebrate
3. Suggest 2 specific, actionable improvements for next week
4. Rate their overall mental wellness (1-10) with explanation

Keep the tone supportive, insightful, and data-driven.`;
};

/**
 * Build a prompt for smart task prioritization
 */
export const buildTaskPrioritizationPrompt = ({ user, moodCheckIn, tasks }) => {
  const { name } = user;
  const { mood, energyLevel, stressLevel } = moodCheckIn;

  const taskList = tasks
    .map(
      (t) =>
        `- ${t.title} [${t.priority}/${t.category}, due: ${
          t.dueDate
            ? new Date(t.dueDate).toLocaleDateString()
            : "no due date"
        }]`
    )
    .join("\n");

  return `You are a productivity AI helping ${name} prioritize tasks intelligently.

## User's Current State
- Mood: ${mood}
- Energy: ${energyLevel}/10
- Stress: ${stressLevel}/10

## All Pending Tasks
${taskList || "No tasks available"}

## Your Task
Given the user's current mental state:
1. Rank all tasks in order of recommended execution
2. For each task, explain why it fits (or doesn't fit) their current energy/mood
3. Suggest an ideal time block for each high-priority task
4. Flag any tasks that should be postponed today

Be concise and format as a numbered ranked list.`;
};

export default {
  sendToAllProviders,
  buildDailySuggestionPrompt,
  buildMoodAnalysisPrompt,
  buildTaskPrioritizationPrompt,
};
