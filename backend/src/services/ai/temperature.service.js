/**
 * ============================================================
 * TEMPERATURE SERVICE
 * ============================================================
 * Controls AI "creativity" (temperature) dynamically based on
 * the type of task being requested.
 *
 * Temperature Guide:
 *   0.0 – 0.3  → Deterministic / factual / analytical
 *   0.4 – 0.6  → Balanced / structured suggestions
 *   0.7 – 0.9  → Creative / empathetic / motivational
 *   1.0+       → Highly creative (avoid for structured output)
 * ============================================================
 */

/**
 * Task type → temperature map
 */
const TEMPERATURE_MAP = {
  daily_suggestion: 0.75,    // Creative + empathetic tone
  mood_analysis: 0.5,        // Balanced — data-driven but warm
  task_prioritization: 0.35, // Analytical — consistent, structured
  quick_chat: 0.8,           // Conversational, natural
  wellness_tip: 0.85,        // Warm and motivational
  goal_planning: 0.6,        // Strategic but open-ended
  default: 0.7,
};

/**
 * Mood-based temperature adjustments
 * High stress → lower creativity (user needs clear, calm guidance)
 * High energy → allow more creative suggestions
 */
const MOOD_ADJUSTMENTS = {
  anxious: -0.15,
  stressed: -0.1,
  overwhelmed: -0.15,
  sad: -0.05,
  neutral: 0,
  calm: 0.05,
  happy: 0.1,
  excited: 0.1,
  motivated: 0.05,
};

/**
 * Energy-level fine-tuning
 * Low energy → simpler, cleaner output (lower temp)
 * High energy → allow richer, more detailed output
 */
const energyAdjustment = (energyLevel) => {
  if (energyLevel <= 3) return -0.1;
  if (energyLevel >= 8) return 0.05;
  return 0;
};

/**
 * Stress-level fine-tuning
 * High stress → keep responses predictable and structured
 */
const stressAdjustment = (stressLevel) => {
  if (stressLevel >= 8) return -0.15;
  if (stressLevel >= 6) return -0.05;
  return 0;
};

/**
 * Get the ideal temperature for an AI request
 *
 * @param {string} taskType    - One of the keys in TEMPERATURE_MAP
 * @param {Object} [moodData]  - Optional: { mood, energyLevel, stressLevel }
 * @returns {{ temperature: number, maxTokens: number, rationale: string }}
 */
export const getTemperatureConfig = (taskType, moodData = null) => {
  // Base temperature from task type
  let temperature = TEMPERATURE_MAP[taskType] ?? TEMPERATURE_MAP.default;

  let rationale = `Base: ${taskType} → ${temperature}`;

  if (moodData) {
    const { mood, energyLevel, stressLevel } = moodData;

    // Mood adjustment
    const moodAdj = MOOD_ADJUSTMENTS[mood?.toLowerCase()] ?? 0;
    if (moodAdj !== 0) {
      temperature += moodAdj;
      rationale += ` | Mood (${mood}): ${moodAdj > 0 ? "+" : ""}${moodAdj}`;
    }

    // Energy adjustment
    if (energyLevel !== undefined) {
      const eAdj = energyAdjustment(energyLevel);
      if (eAdj !== 0) {
        temperature += eAdj;
        rationale += ` | Energy (${energyLevel}): ${eAdj > 0 ? "+" : ""}${eAdj}`;
      }
    }

    // Stress adjustment
    if (stressLevel !== undefined) {
      const sAdj = stressAdjustment(stressLevel);
      if (sAdj !== 0) {
        temperature += sAdj;
        rationale += ` | Stress (${stressLevel}): ${sAdj > 0 ? "+" : ""}${sAdj}`;
      }
    }
  }

  // Clamp between 0.1 and 1.0
  temperature = Math.max(0.1, Math.min(1.0, parseFloat(temperature.toFixed(2))));
  rationale += ` → Final: ${temperature}`;

  // Token budget based on task type
  const tokenMap = {
    daily_suggestion: 1024,
    mood_analysis: 800,
    task_prioritization: 900,
    quick_chat: 512,
    wellness_tip: 400,
    goal_planning: 1024,
    default: 768,
  };
  const maxTokens = tokenMap[taskType] ?? tokenMap.default;

  return { temperature, maxTokens, rationale };
};

/**
 * Get a simplified temperature (number only) for a quick call
 *
 * @param {string} taskType
 * @param {Object} [moodData]
 * @returns {number}
 */
export const getTemperature = (taskType, moodData = null) => {
  return getTemperatureConfig(taskType, moodData).temperature;
};

export default { getTemperatureConfig, getTemperature };
