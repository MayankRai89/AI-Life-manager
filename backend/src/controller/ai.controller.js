import * as aiService from "../services/ai/ai.service.js";
import * as moodService from "../services/mood.service.js";
import * as taskService from "../services/task.service.js";
import asyncHandler from "../utils/asyncHandler.js";
import { AppError } from "../middleware/errorHandler.middleware.js";

/**
 * @desc    Get a personalized daily plan based on current mood + tasks
 * @route   GET /api/ai/daily-suggestion
 * @access  Private
 */
export const getDailySuggestion = asyncHandler(async (req, res) => {
  const user = req.user;

  // Fetch latest mood check-in
  const latestMood = await moodService.getLatestMoodCheckIn(user._id);
  if (!latestMood) {
    throw new AppError(
      "No mood check-in found. Please log your mood first to get personalized suggestions.",
      400
    );
  }

  // Fetch pending/in-progress tasks
  const { tasks } = await taskService.getTasks(user._id, {
    status: "pending",
    limit: 10,
  });

  const result = await aiService.generateDailySuggestion({
    user,
    moodCheckIn: latestMood,
    tasks,
  });

  res.status(200).json({
    status: "success",
    data: {
      suggestion: result.text,
      meta: {
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
    status: "pending",
    limit: 10,
  });

  if (!tasks.length) {
    throw new AppError("No pending tasks found to prioritize.", 400);
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
