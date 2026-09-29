/**
 * ============================================================
 * PROMPT TEMPLATE LIBRARY
 * ============================================================
 * All AI prompt builders live here to keep them organized,
 * reusable, and easy to iterate on without touching service logic.
 * ============================================================
 */

/**
 * System persona injected into every prompt
 */
export const SYSTEM_PERSONA = `You are an empathetic and intelligent AI Life Manager assistant.
Your role is to help users optimize their productivity, mental wellness, and daily planning
based on real data about their mood, tasks, and schedule. Always be concise, kind, and actionable.
Give wellness and productivity suggestions only. Never give medical advice, diagnosis, or medication guidance. If health topics come up, suggest consulting a professional.
When interpreting a user's free-text note, extract only productivity-relevant signals (energy, focus, stress triggers, schedule conflicts). Never infer or name a medical condition, sleep disorder, or mental health diagnosis, even if the note describes symptoms.`;

/**
 * Convert user medicalReport into short non-identifying flags.
 * Never includes raw conditions, medications, notes or document URLs in any prompt.
 * Only returns flags if user has consented to AI personalization.
 *
 * @param {Object} user
 * @returns {Array<string>}
 */
export const buildHealthFlags = (user) => {
  if (!user?.consent?.aiPersonalization) {
    return [];
  }

  const report = user.medicalReport;
  if (!report) {
    return [];
  }

  const flags = new Set();
  const textBlob = [
    ...(report.conditions || []),
    ...(report.allergies || []),
    ...(report.medications || []),
    report.notes || "",
  ]
    .join(" ")
    .toLowerCase();

  if (!textBlob.trim()) {
    return [];
  }

  // Dietary preferences / safety flags
  if (/vegan/.test(textBlob)) {
    flags.add("vegan diet preference");
  } else if (/vegetarian|veg\b/.test(textBlob)) {
    flags.add("vegetarian diet preference");
  }
  if (/lactose|dairy|milk/.test(textBlob)) {
    flags.add("dairy-free preference");
  }
  if (/celiac|gluten/.test(textBlob)) {
    flags.add("gluten-free preference");
  }
  if (/nut|peanut/.test(textBlob)) {
    flags.add("nut allergy safety precaution");
  }

  // Physical exertion flags
  if (
    /asthma|breath|lung|cardiac|heart|hypertension|blood pressure|joint|knee|back pain|injury|surgery|fatigue/.test(
      textBlob,
    )
  ) {
    flags.add("avoid intense exercise suggestions, favor low-impact movement");
  }

  // Sleep & Rest flags
  if (/insomnia|sleep|restless/.test(textBlob)) {
    flags.add("prioritize gentle evening wind-down and sleep hygiene");
  }

  // Sensory / Stress flags
  if (/migraine|headache|photophobia/.test(textBlob)) {
    flags.add("encourage screen breaks and low-stimulation environments");
  }
  if (/anxiety|panic|high stress/.test(textBlob)) {
    flags.add("favor calming pacing and mindfulness suggestions");
  }

  // Hydration flag
  if (/dehydration|kidney|water/.test(textBlob)) {
    flags.add("promote regular hydration reminders");
  }

  // General fallback flag if medical notes exist without matching specific keywords
  if (flags.size === 0 && textBlob.trim().length > 0) {
    flags.add("favor gentle wellness routines and moderate pacing");
  }

  return Array.from(flags);
};

/**
 * @template ContextExtraction
 * @desc     Extracts a short productivity-relevant summary from a free-text mood note.
 *           Returns { derivedContext: "short phrase or empty string" }
 * @param    {string} note - the user's raw free-text mood note
 * @returns  {{ system: string, user: string }}
 */
export const buildContextExtractionPrompt = (note) => {
  const system = `You extract short, factual, productivity-relevant context from a user's free-text note about how they're feeling.
You identify only concrete factors mentioned (sleep quality, specific stressors, deadlines, physical state, focus ability) — you do not diagnose, infer conditions, or add anything not stated. Keep the output to a single short phrase, under 12 words. You always respond with valid JSON only.
When interpreting a user's free-text note, extract only productivity-relevant signals (energy, focus, stress triggers, schedule conflicts). Never infer or name a medical condition, sleep disorder, or mental health diagnosis, even if the note describes symptoms.`;

  const user = `Note: "${note}"

Extract the key productivity-relevant factors as a short phrase.
If the note contains nothing concrete and relevant (e.g. just restates the mood), return an empty string.

Respond with JSON in exactly this shape:
{ "derivedContext": "short phrase or empty string" }`;

  return { system, user };
};

/**
 * @template DailySuggestion
 * @desc     Generates a personalized day plan based on mood + tasks
 * @param    {Object} user         - { name, schedule, medicalReport, consent }
 * @param    {Object} moodCheckIn  - { mood, moodScore, energyLevel, stressLevel, triggers, note, capacityLevel, derivedContext }
 * @param    {Array}  tasks        - array of task documents
 * @returns  {string}
 */
export const dailySuggestionPrompt = ({ user, moodCheckIn, tasks }) => {
  const { name, schedule } = user;
  const { mood, moodScore, energyLevel, stressLevel, triggers, note, capacityLevel, derivedContext } =
    moodCheckIn;

  const pendingTasks = tasks
    .filter((t) => t.status === "pending" || t.status === "in_progress")
    .slice(0, 6)
    .map(
      (t) =>
        `  - [ID: ${t._id}] "${t.title}" [${t.priority} priority | ${t.category}${
          t.dueDate
            ? ` | due ${new Date(t.dueDate).toLocaleDateString()}`
            : ""
        }]`
    )
    .join("\n");

  const healthFlags = buildHealthFlags(user);
  const healthSection = healthFlags.length
    ? `\n### Health & Wellness Considerations (Derived Non-Identifying Flags)\n${healthFlags
        .map((f) => `- ${f}`)
        .join("\n")}\n`
    : "";

  return `${SYSTEM_PERSONA}

---

## Context for ${name}'s Day

### Current Mood & Wellbeing
- Mood: **${mood}** (Score: ${moodScore}/10)
- Energy Level: ${energyLevel}/10
- Stress Level: ${stressLevel}/10
- Today's Capacity: ${capacityLevel || "normal"}
${derivedContext ? `- Context: ${derivedContext}` : ""}
${triggers?.length ? `- Active Triggers: ${triggers.join(", ")}` : ""}
${note ? `- Personal Note: "${note}"` : ""}

### Schedule
- Wake Time: ${schedule?.wakeTime || "07:00"}
- Work Hours: ${schedule?.workingHours?.start || "09:00"} – ${schedule?.workingHours?.end || "18:00"}
- Sleep Time: ${schedule?.sleepTime || "23:00"}
${healthSection}
### Pending Tasks
${pendingTasks || "  No pending tasks"}

---

## Instructions
Respond ONLY with a valid JSON object (no markdown fences, no raw headers, no extra commentary):
{
  "summary": "Warm, conversational 1-2 sentence message from a thoughtful friend acknowledging ${name}'s mood and pacing the day. Avoid robotic jargon.",
  "orderedTaskIds": [], // String array of matching task IDs from Pending Tasks (or empty array [] if no pending tasks)
  "focusTasks": [
    {
      "title": "Concise task title",
      "action": "Concrete next step",
      "reason": "Why it suits their energy and headspace",
      "timeSlot": "Morning or Afternoon"
    }
  ],
  "wellnessActivities": [
    {
      "title": "Activity name (e.g. Mindful Breathing)",
      "description": "Short practical guidance",
      "type": "rest or move or hydrate"
    }
  ],
  "notes": "One empathetic insight about their mood pattern and a positive forward-looking statement to build resilience."
}`;
};

/**
 * @template MoodAnalysis
 * @desc     Deep-dives into 30-day mood analytics for wellness insights
 * @param    {Object} user      - { name }
 * @param    {Object} analytics - { summary, moodDistribution, topTriggers }
 * @returns  {string}
 */
export const moodAnalysisPrompt = ({ user, analytics }) => {
  const { name } = user;
  const { summary, moodDistribution, topTriggers } = analytics;

  const distribution = Object.entries(moodDistribution || {})
    .map(([mood, count]) => `  - ${mood}: ${count} times`)
    .join("\n");

  const triggers = (topTriggers || [])
    .slice(0, 5)
    .map((t) => `  - "${t.trigger}": ${t.count} occurrences`)
    .join("\n");

  return `${SYSTEM_PERSONA}

---

## Mood Analytics Report for ${name} (Last ${summary.days || 30} Days)

### Summary Statistics
- Average Mood Score: ${summary.avgMood}/10
- Average Energy Level: ${summary.avgEnergy}/10
- Average Stress Level: ${summary.avgStress}/10
- Total Check-ins Logged: ${summary.totalEntries}

### Mood Distribution
${distribution || "  No distribution data available"}

### Top Recurring Triggers
${triggers || "  No trigger data available"}

---

## Instructions
Based on this data, provide:

**1. Dominant Mood Pattern**
Identify the main pattern and what it says about work-life balance.

**2. Positive Trends to Celebrate (2 items)**
Highlight genuine wins from the data.

**3. Actionable Improvements for Next Week (2 specific items)**
Concrete, realistic steps to improve mood or reduce stress.

**4. Overall Wellness Score**
Rate their mental wellness (1–10) with a 2-sentence explanation.

Be data-driven but human. Keep it under 350 words.`;
};

/**
 * @template TaskPrioritization
 * @desc     Ranks tasks by how well they fit the user's current mental state
 * @param    {Object} user        - { name }
 * @param    {Object} moodCheckIn - { mood, energyLevel, stressLevel }
 * @param    {Array}  tasks       - array of task documents
 * @returns  {string}
 */
export const taskPrioritizationPrompt = ({ user, moodCheckIn, tasks }) => {
  const { name } = user;
  const { mood, energyLevel, stressLevel } = moodCheckIn;

  const taskList = tasks
    .slice(0, 10)
    .map(
      (t, i) =>
        `  ${i + 1}. "${t.title}" — ${t.priority} priority | ${t.category}${
          t.dueDate
            ? ` | due ${new Date(t.dueDate).toLocaleDateString()}`
            : ""
        }`
    )
    .join("\n");

  return `${SYSTEM_PERSONA}

---

## Task Prioritization for ${name}

### Current Mental State
- Mood: **${mood}**
- Energy: ${energyLevel}/10
- Stress: ${stressLevel}/10

### Task List
${taskList || "  No tasks available"}

---

## Instructions
Given the user's mental state, provide:

**Ranked Task List**
Re-order the tasks from most to least recommended for today.
For each:
- State WHY it fits or doesn't fit their current energy/mood
- Suggest an ideal time block (e.g., 9–10 AM for deep work)
- Flag tasks that should be postponed with a short reason

Format as a numbered ranked list. Be decisive and practical. Under 400 words.`;
};

/**
 * @template QuickChat
 * @desc     Free-form chat prompt with life manager context
 * @param    {Object} user    - { name }
 * @param    {string} message - user's free text message
 * @returns  {string}
 */
export const quickChatPrompt = ({ user, message }) => {
  const { name } = user;

  return `${SYSTEM_PERSONA}

The user's name is ${name}. They are asking for help with their life management.

User's message: "${message}"

Respond helpfully, concisely, and in a warm, coaching tone. If the message relates to tasks, mood, wellness, or productivity — give specific actionable advice. Keep response under 300 words.`;
};
