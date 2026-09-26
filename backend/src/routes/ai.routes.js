import express from "express";
import {
  getDailySuggestion,
  getMoodAnalysis,
  getPrioritizedTasks,
  chat,
} from "../controller/ai.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { body } from "express-validator";
import { validate } from "../middleware/validate.middleware.js";

const router = express.Router();

// All AI routes require authentication
router.use(protect);

/**
 * @route   GET /api/ai/daily-suggestion
 * @desc    Personalized day plan based on latest mood + pending tasks
 * @access  Private
 */
router.get("/daily-suggestion", getDailySuggestion);

/**
 * @route   GET /api/ai/mood-analysis
 * @desc    AI-powered wellness insights from mood analytics
 * @query   days (optional, default: 30) — number of days to analyze
 * @access  Private
 */
router.get("/mood-analysis", getMoodAnalysis);

/**
 * @route   GET /api/ai/prioritize-tasks
 * @desc    Smart task ranking based on current mental state
 * @access  Private
 */
router.get("/prioritize-tasks", getPrioritizedTasks);

/**
 * @route   POST /api/ai/chat
 * @desc    Free-form chat with the AI Life Manager
 * @access  Private
 */
router.post(
  "/chat",
  [
    body("message")
      .trim()
      .notEmpty()
      .withMessage("Message is required")
      .isLength({ min: 2, max: 2000 })
      .withMessage("Message must be between 2 and 2000 characters"),
  ],
  validate,
  chat
);

export default router;
