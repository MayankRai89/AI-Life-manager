import * as moodService from "../services/mood.service.js";
import asyncHandler from "../utils/asyncHandler.js";

/**
 * @desc    Create a new mood check-in
 * @route   POST /api/moods
 * @access  Private
 */
export const createMoodCheckIn = asyncHandler(async (req, res) => {
  const newCheckIn = await moodService.createMoodCheckIn(
    req.user._id,
    req.body
  );

  res.status(201).json({
    status: "success",
    message: "Mood check-in recorded successfully",
    data: {
      moodCheckIn: newCheckIn,
    },
  });
});

/**
 * @desc    Get all mood check-ins (with filters & pagination)
 * @route   GET /api/moods
 * @access  Private
 */
export const getMoodCheckIns = asyncHandler(async (req, res) => {
  const result = await moodService.getMoodCheckIns(req.user._id, req.query);

  res.status(200).json({
    status: "success",
    results: result.moodCheckIns.length,
    pagination: result.pagination,
    data: {
      moodCheckIns: result.moodCheckIns,
    },
  });
});

/**
 * @desc    Get latest mood check-in
 * @route   GET /api/moods/latest
 * @access  Private
 */
export const getLatestMoodCheckIn = asyncHandler(async (req, res) => {
  const latestCheckIn = await moodService.getLatestMoodCheckIn(req.user._id);

  res.status(200).json({
    status: "success",
    data: {
      moodCheckIn: latestCheckIn || null,
    },
  });
});

/**
 * @desc    Get mood check-in by ID
 * @route   GET /api/moods/:id
 * @access  Private
 */
export const getMoodCheckInById = asyncHandler(async (req, res) => {
  const checkIn = await moodService.getMoodCheckInById(
    req.user._id,
    req.params.id
  );

  res.status(200).json({
    status: "success",
    data: {
      moodCheckIn: checkIn,
    },
  });
});

/**
 * @desc    Update a mood check-in
 * @route   PUT /api/moods/:id
 * @access  Private
 */
export const updateMoodCheckIn = asyncHandler(async (req, res) => {
  const updatedCheckIn = await moodService.updateMoodCheckIn(
    req.user._id,
    req.params.id,
    req.body
  );

  res.status(200).json({
    status: "success",
    message: "Mood check-in updated successfully",
    data: {
      moodCheckIn: updatedCheckIn,
    },
  });
});

/**
 * @desc    Delete a mood check-in
 * @route   DELETE /api/moods/:id
 * @access  Private
 */
export const deleteMoodCheckIn = asyncHandler(async (req, res) => {
  await moodService.deleteMoodCheckIn(req.user._id, req.params.id);

  res.status(200).json({
    status: "success",
    message: "Mood check-in deleted successfully",
  });
});

/**
 * @desc    Get mood analytics & insights
 * @route   GET /api/moods/analytics
 * @access  Private
 */
export const getMoodAnalytics = asyncHandler(async (req, res) => {
  const analytics = await moodService.getMoodAnalytics(
    req.user._id,
    req.query.days
  );

  res.status(200).json({
    status: "success",
    data: analytics,
  });
});
