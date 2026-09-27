import * as aiService from "../services/ai/ai.service.js";
import * as moodService from "../services/mood.service.js";
import * as taskService from "../services/task.service.js";
import DayPlan from "../model/dayPlan.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import { AppError } from "../middleware/errorHandler.middleware.js";

/**
 * @desc    Get a personalized daily plan based on current mood + tasks.
 *          Checks MongoDB first: returns saved plan if mood hasn't changed.
 *          Generates & persists a new plan when mood changes or forceRefresh=true.
 * @route   GET /api/ai/daily-suggestion
 * @access  Private
 */
export const getDailySuggestion = asyncHandler(async (req, res) => {
  const user = req.user;
  const forceRefresh =
    req.query.forceRefresh === "true" || req.query.recalculate === "true";

  // Fetch latest mood check-in
  const latestMood = await moodService.getLatestMoodCheckIn(user._id);
  if (!latestMood) {
    throw new AppError(
      "No mood check-in found. Please log your mood first to get personalized suggestions.",
      400
    );
  }

  const todayStr = new Date().toISOString().split("T")[0];

  // 1. Check if we already have a saved plan for this exact mood check-in
  if (!forceRefresh) {
    const existingPlan = await DayPlan.findOne({
      userId: user._id,
      moodCheckInId: latestMood._id,
    });

    if (existingPlan) {
      return res.status(200).json({
        status: "success",
        data: {
          plan: existingPlan,
          suggestion: existingPlan.summary,
          summary: existingPlan.summary,
          orderedTaskIds: existingPlan.orderedTaskIds || [],
          focusTasks: existingPlan.focusTasks || [],
          wellnessActivities: existingPlan.wellnessActivities || [],
          notes: existingPlan.notes || "",
          meta: {
            fromCache: true,
            provider: existingPlan.provider,
            basedOnMood: latestMood.mood,
            date: existingPlan.date,
          },
        },
      });
    }
  }

  // 2. Otherwise generate a new plan from AI and persist to MongoDB
  const { tasks } = await taskService.getTasks(user._id, {
    status: ["pending", "in_progress"],
    limit: 10,
  });

  const result = await aiService.generateDailySuggestion({
    user,
    moodCheckIn: latestMood,
    tasks,
  });

  // Try to parse structured JSON from model
  let parsedPlan = null;
  try {
    const cleaned = (result.text || "")
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/```\s*$/i, "")
      .trim();
    parsedPlan = JSON.parse(cleaned);
  } catch (err) {
    // If model returned markdown, use raw text as summary
  }

  const summary = parsedPlan?.summary || result.text;
  const focusTasks = parsedPlan?.focusTasks || [];
  const wellnessActivities = parsedPlan?.wellnessActivities || [];
  const notes = parsedPlan?.notes || "";
  const orderedTaskIds = parsedPlan?.orderedTaskIds || [];

  // 3. Save or update the plan in MongoDB linked to this mood check-in
  const savedPlan = await DayPlan.findOneAndUpdate(
    { userId: user._id, moodCheckInId: latestMood._id },
    {
      userId: user._id,
      moodCheckInId: latestMood._id,
      date: todayStr,
      moodSnapshot: {
        mood: latestMood.mood,
        moodScore: latestMood.moodScore,
        energyLevel: latestMood.energyLevel,
        stressLevel: latestMood.stressLevel,
      },
      summary,
      focusTasks,
      wellnessActivities,
      notes,
      orderedTaskIds,
      provider: result.provider || "ai",
    },
    { upsert: true, new: true, runValidators: true }
  );

  res.status(200).json({
    status: "success",
    data: {
      plan: savedPlan,
      suggestion: summary,
      summary,
      orderedTaskIds,
      focusTasks,
      wellnessActivities,
      notes,
      meta: {
        fromCache: false,
        provider: result.provider,
        duration: result.duration,
        basedOnMood: latestMood.mood,
        taskCount: tasks.length,
        allProviders: result.allProviders,
      },
    },
  });
});

/**
 * @desc    Analyze mood patterns and return wellness insights
 * @route   GET /api/ai/mood-analysis
 * @access  Private
 */
export const getMoodAnalysis = asyncHandler(async (req, res) => {
  const user = req.user;
  const days = parseInt(req.query.days) || 30;

  const analytics = await moodService.getMoodAnalytics(user._id, days);

  if (!analytics?.summary?.totalEntries) {
    throw new AppError(
      "Not enough mood data for analysis. Please log at least one mood check-in.",
      400
    );
  }

  const result = await aiService.analyzeMoodPatterns({ user, analytics });

  res.status(200).json({
    status: "success",
    data: {
      analysis: result.text,
      analyticsSnapshot: analytics.summary,
      meta: {
        provider: result.provider,
        duration: result.duration,
        daysCovered: days,
        allProviders: result.allProviders,
      },
    },
  });
});

/**
 * @desc    Get smart task ranking based on current mental state
 * @route   GET /api/ai/prioritize-tasks
 * @access  Private
 */
export const getPrioritizedTasks = asyncHandler(async (req, res) => {
  const user = req.user;

  const latestMood = await moodService.getLatestMoodCheckIn(user._id);
  if (!latestMood) {
    throw new AppError(
      "No mood check-in found. Please log your mood first to enable smart task prioritization.",
      400
    );
  }

  const { tasks } = await taskService.getTasks(user._id, {
    status: ["pending", "in_progress"],
    limit: 10,
  });

  if (!tasks.length) {
    throw new AppError("No pending or in-progress tasks found to prioritize.", 400);
  }

  const result = await aiService.prioritizeTasks({
    user,
    moodCheckIn: latestMood,
    tasks,
  });

  res.status(200).json({
    status: "success",
    data: {
      prioritization: result.text,
      meta: {
        provider: result.provider,
        duration: result.duration,
        taskCount: tasks.length,
        currentMood: latestMood.mood,
        allProviders: result.allProviders,
      },
    },
  });
});

/**
 * @desc    Free-form chat with the AI Life Manager
 * @route   POST /api/ai/chat
 * @access  Private
 */
export const chat = asyncHandler(async (req, res) => {
  const { message } = req.body;

  if (!message || message.trim().length < 2) {
    throw new AppError("Please provide a message to chat with the AI.", 400);
  }

  const result = await aiService.quickChat({
    user: req.user,
    message: message.trim(),
  });

  res.status(200).json({
    status: "success",
    data: {
      reply: result.text,
      meta: {
        provider: result.provider,
        duration: result.duration,
        allProviders: result.allProviders,
      },
    },
  });
});
