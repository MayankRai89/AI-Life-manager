import express from "express";
import rateLimit from "express-rate-limit";
import { getFeedback, getStats } from "../controller/admin.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { adminOnly } from "../middleware/admin.middleware.js";

const router = express.Router();

// Specific rate limiter for admin endpoints (protect against abuse / scraping)
const adminLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 60, // Max 60 requests per minute
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: "fail",
    message: "Too many admin requests. Please wait a moment before trying again.",
  },
});

// All admin routes require authentication, admin role, and rate limiting
router.use(protect);
router.use(adminOnly);
router.use(adminLimiter);

/**
 * @route   GET /api/admin/feedback
 * @desc    Get paginated, anonymized day plan feedback
 * @access  Private (Admin only)
 */
router.get("/feedback", getFeedback);

/**
 * @route   GET /api/admin/stats
 * @desc    Get aggregated day plan feedback statistics
 * @access  Private (Admin only)
 */
router.get("/stats", getStats);

export default router;
