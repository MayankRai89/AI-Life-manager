import express from "express";
import {
  createMoodCheckIn,
  getMoodCheckIns,
  getLatestMoodCheckIn,
  getMoodCheckInById,
  updateMoodCheckIn,
  deleteMoodCheckIn,
  getMoodAnalytics,
} from "../controller/mood.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

// All mood routes require authentication
router.use(protect);

router.route("/").get(getMoodCheckIns).post(createMoodCheckIn);

router.get("/latest", getLatestMoodCheckIn);
router.get("/analytics", getMoodAnalytics);

router
  .route("/:id")
  .get(getMoodCheckInById)
  .put(updateMoodCheckIn)
  .delete(deleteMoodCheckIn);

export default router;
