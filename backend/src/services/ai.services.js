const Task = require("../models/Task.model");
const MoodCheckin = require("../models/moodCheckIn.model");

async function generateDayPlan(userId, { mood, mood_score, note }) {
  // Record mood check-in
  await MoodCheckin.create({
    userId,
    mood: mood || "neutral",
    moodScore: mood_score || 5,
    energyLevel: mood_score || 5,
    notes: note || "",
  });

  const level = mood_score || 5;
  let plan_message = "";
  let suggested_tasks = [];

  if (level <= 4 || mood === "tired" || mood === "sad" || mood === "anxious") {
    plan_message = `I notice your energy level is around ${level}/10. Let me give you a lighter, restorative day plan focused on well-being and gentle tasks.`;
    suggested_tasks = [
      {
        title: "Morning Hydration & Gentle Stretch",
        estimated_time: "15 mins",
        description: "Drink a glass of water and perform light breathing exercises.",
        energy_required: "low",
      },
      {
        title: "Focused Work Sprint (Single Task)",
        estimated_time: "30 mins",
        description: "Pick your highest priority task and work for 30 minutes.",
        energy_required: "medium",
      },
      {
        title: "Afternoon Mindful Walk or Rest",
        estimated_time: "20 mins",
        description: "Step away from screens and refresh your focus.",
        energy_required: "low",
      },
    ];
  } else if (level <= 7 || mood === "neutral" || mood === "calm") {
    plan_message = `Your energy level is ${level}/10. Here is a balanced plan designed to keep you steady and productive today.`;
    suggested_tasks = [
      {
        title: "Core Work Block - High Focus",
        estimated_time: "45 mins",
        description: "Tackle your primary task of the day with full concentration.",
        energy_required: "high",
      },
      {
        title: "Review & Inbox Clearing",
        estimated_time: "25 mins",
        description: "Organize pending messages, emails, and quick admin tasks.",
        energy_required: "medium",
      },
      {
        title: "Short Physical Exercise / Walk",
        estimated_time: "30 mins",
        description: "Get moving to boost your physical energy and mental clarity.",
        energy_required: "medium",
      },
      {
        title: "Evening Wind Down & Journaling",
        estimated_time: "15 mins",
        description: "Reflect on accomplishments and clear your head for tomorrow.",
        energy_required: "low",
      },
    ];
  } else {
    plan_message = `Awesome! Your energy level is high (${level}/10)! Here is an ambitious day plan to maximize your momentum today!`;
    suggested_tasks = [
      {
        title: "Deep Work Sprint #1",
        estimated_time: "60 mins",
        description: "Solve complex problems while your focus and drive are peak.",
        energy_required: "high",
      },
      {
        title: "High Intensity Workout / Cardio",
        estimated_time: "45 mins",
        description: "Capitalize on high energy levels with an active workout session.",
        energy_required: "high",
      },
      {
        title: "Project Strategy & Brainstorming",
        estimated_time: "40 mins",
        description: "Plan out weekly goals and outline new creative initiatives.",
        energy_required: "high",
      },
      {
        title: "Team Check-in / Learning Session",
        estimated_time: "30 mins",
        description: "Share progress or read up on a new skill topic.",
        energy_required: "medium",
      },
    ];
  }

  return { plan_message, suggested_tasks };
}

async function savePlan(userId, tasksArray) {
  if (!Array.isArray(tasksArray)) {
    throw new Error("Tasks must be an array");
  }

  const createdTasks = [];
  for (const item of tasksArray) {
    const task = await Task.create({
      userId,
      title: item.title,
      description: item.description || (item.estimated_time ? `Estimated: ${item.estimated_time}` : ""),
      priority: item.energy_required === "high" ? "high" : "medium",
      category: "ai-generated",
    });
    createdTasks.push(task);
  }

  return { success: true, count: createdTasks.length, tasks: createdTasks };
}

module.exports = {
  generateDayPlan,
  savePlan,
};
