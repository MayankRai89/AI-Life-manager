import mongoose from "mongoose";
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
            provider: existingPlan.providerUsed || existingPlan.provider,
            providerUsed: existingPlan.providerUsed || existingPlan.provider,
            basedOnMood: latestMood.mood,
            date: existingPlan.date,
          },
        },
      });
    }
  }

  // 2. 60-Second Cooldown Check: Prevent repeated AI calls from rapid check-ins
  const recentPlan = await DayPlan.findOne({ userId: user._id }).sort({
    updatedAt: -1,
  });

  if (recentPlan) {
    const lastPlanTime = new Date(
      recentPlan.updatedAt || recentPlan.requestedAt || recentPlan.createdAt
    ).getTime();
    const elapsedMs = Date.now() - lastPlanTime;
    const COOLDOWN_MS = 60 * 1000;

    if (elapsedMs < COOLDOWN_MS) {
      return res.status(200).json({
        status: "success",
        data: {
          plan: recentPlan,
          suggestion: recentPlan.summary,
          summary: recentPlan.summary,
          orderedTaskIds: recentPlan.orderedTaskIds || [],
          focusTasks: recentPlan.focusTasks || [],
          wellnessActivities: recentPlan.wellnessActivities || [],
          notes: recentPlan.notes || "",
          meta: {
            fromCache: true,
            cooldown: true,
            cooldownRemainingSeconds: Math.ceil((COOLDOWN_MS - elapsedMs) / 1000),
            provider: recentPlan.providerUsed || recentPlan.provider,
            providerUsed: recentPlan.providerUsed || recentPlan.provider,
            basedOnMood: recentPlan.moodSnapshot?.mood || latestMood.mood,
            date: recentPlan.date,
          },
        },
      });
    }
  }

  // 3. Otherwise generate a new plan from AI and persist to MongoDB
  const { tasks } = await taskService.getTasks(user._id, {
    status: ["pending", "in_progress"],
    limit: 10,
  });

  const result = await aiService.generateDailySuggestion({
    user,
    moodCheckIn: latestMood,   // already contains capacityLevel + derivedContext from schema
    tasks,
  });

  // Parse structured plan from result.data or fallback text
  let parsedPlan = null;
  if (result.data && typeof result.data === "object") {
    parsedPlan = result.data;
  } else {
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
  }

  const summary = parsedPlan?.summary || result.text || "";
  const focusTasks = Array.isArray(parsedPlan?.focusTasks)
    ? parsedPlan.focusTasks
    : [];
  const wellnessActivities = Array.isArray(parsedPlan?.wellnessActivities)
    ? parsedPlan.wellnessActivities
    : [];
  const notes = parsedPlan?.notes || "";

  // Robust parsing & validation of orderedTaskIds to prevent CastError
  let rawOrderedTaskIds = parsedPlan?.orderedTaskIds || [];
  if (typeof rawOrderedTaskIds === "string") {
    try {
      rawOrderedTaskIds = JSON.parse(rawOrderedTaskIds.replace(/'/g, '"'));
    } catch {
      rawOrderedTaskIds = [];
    }
  }
  if (!Array.isArray(rawOrderedTaskIds)) {
    rawOrderedTaskIds = [];
  }

  // Flatten in case of nested arrays or array strings inside an array element
  const flattenedTaskIds = [];
  for (const item of rawOrderedTaskIds) {
    if (typeof item === "string" && item.trim().startsWith("[")) {
      try {
        const parsedNested = JSON.parse(item.replace(/'/g, '"'));
        if (Array.isArray(parsedNested)) {
          flattenedTaskIds.push(...parsedNested);
          continue;
        }
      } catch {
        // ignore
      }
    }
    flattenedTaskIds.push(item);
  }

  const validTaskIds = new Set(tasks.map((t) => t._id.toString()));
  const titleToIdMap = new Map(
    tasks.map((t) => [t.title?.toLowerCase().trim(), t._id])
  );

  const orderedTaskIds = flattenedTaskIds
    .map((item) => {
      if (!item) return null;
      const strItem = typeof item === "string" ? item.trim() : item.toString();
      // Match existing task ID directly
      if (mongoose.Types.ObjectId.isValid(strItem) && validTaskIds.has(strItem)) {
        return strItem;
      }
      // Match by title
      const matchedId = titleToIdMap.get(strItem.toLowerCase());
      if (matchedId) {
        return matchedId.toString();
      }
      // If it's a valid ObjectId in general
      if (mongoose.Types.ObjectId.isValid(strItem)) {
        return strItem;
      }
      return null;
    })
    .filter(Boolean);

  const providerUsed = result.providerUsed || result.provider || "ai";

  // 4. Save or update the plan in MongoDB linked to this mood check-in
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
        capacityLevel: latestMood.capacityLevel || "normal",
        derivedContext: latestMood.derivedContext || "",
        checkInTime: latestMood.checkInTime || latestMood.createdAt || new Date(),
        time: latestMood.time || "",
      },
      requestedAt: new Date(),
      summary,
      focusTasks,
      wellnessActivities,
      notes,
      orderedTaskIds,
      provider: providerUsed,
      providerUsed,
    },
    { upsert: true, returnDocument: "after", runValidators: true }
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
        provider: providerUsed,
        providerUsed,
        duration: result.latencyMs || result.duration,
        latencyMs: result.latencyMs || result.duration,
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
      analysis: result.data || result.text,
      analyticsSnapshot: analytics.summary,
      meta: {
        provider: result.providerUsed || result.provider,
        providerUsed: result.providerUsed || result.provider,
        duration: result.latencyMs || result.duration,
        latencyMs: result.latencyMs || result.duration,
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
      prioritization: result.data || result.text,
      meta: {
        provider: result.providerUsed || result.provider,
        providerUsed: result.providerUsed || result.provider,
        duration: result.latencyMs || result.duration,
        latencyMs: result.latencyMs || result.duration,
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
      reply: result.data || result.text,
      meta: {
        provider: result.providerUsed || result.provider,
        providerUsed: result.providerUsed || result.provider,
        duration: result.latencyMs || result.duration,
        latencyMs: result.latencyMs || result.duration,
        allProviders: result.allProviders,
      },
    },
  });
});
