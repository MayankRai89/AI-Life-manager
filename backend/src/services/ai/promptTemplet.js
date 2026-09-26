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
based on real data about their mood, tasks, and schedule. Always be concise, kind, and actionable.`;

/**
 * @template DailySuggestion
 * @desc     Generates a personalized day plan based on mood + tasks
 * @param    {Object} user         - { name, schedule }
 * @param    {Object} moodCheckIn  - { mood, moodScore, energyLevel, stressLevel, triggers, note }
 * @param    {Array}  tasks        - array of task documents
 * @returns  {string}
 */
export const dailySuggestionPrompt = ({ user, moodCheckIn, tasks }) => {
  const { name, schedule } = user;
  const { mood, moodScore, energyLevel, stressLevel, triggers, note } =
    moodCheckIn;

  const pendingTasks = tasks
    .filter((t) => t.status === "pending" || t.status === "in_progress")
    .slice(0, 6)
    .map(
      (t) =>
        `  - "${t.title}" [${t.priority} priority | ${t.category}${
          t.dueDate
            ? ` | due ${new Date(t.dueDate).toLocaleDateString()}`
            : ""
        }]`
    )
    .join("\n");

  return `${SYSTEM_PERSONA}

---

## Context for ${name}'s Day

### Current Mood & Wellbeing
- Mood: **${mood}** (Score: ${moodScore}/10)
- Energy Level: ${energyLevel}/10
- Stress Level: ${stressLevel}/10
${triggers?.length ? `- Active Triggers: ${triggers.join(", ")}` : ""}
${note ? `- Personal Note: "${note}"` : ""}

### Schedule
- Wake Time: ${schedule?.wakeTime || "07:00"}
- Work Hours: ${schedule?.workingHours?.start || "09:00"} – ${schedule?.workingHours?.end || "18:00"}
- Sleep Time: ${schedule?.sleepTime || "23:00"}

### Pending Tasks
${pendingTasks || "  No pending tasks"}

---

## Instructions
Based on the above data, provide:

**1. Top 3 Focus Tasks for Today**
For each task, briefly explain WHY it suits the user's current energy and mood.

**2. Wellness Activities (2 suggestions)**
Short, practical activities matching their current mood and stress level.

**3. Motivational Insight**
One empathetic insight about their mood pattern and a positive forward-looking statement.

Keep your response structured, warm, and under 400 words.`;
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
