import MoodCheckIn from "../model/moodCheckins.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import { AppError } from "../middleware/errorHandler.middleware.js";

/**
 * @desc    Create a new mood check-in
 * @route   POST /api/moods
 * @access  Private
 */
export const createMoodCheckIn = asyncHandler(async (req, res) => {
  const {
    mood,
    moodScore,
    energyLevel,
    stressLevel,
    emotions,
    triggers,
    note,
    aiInsights,
    checkInTime,
  } = req.body;

  if (!mood || moodScore === undefined) {
    throw new AppError("Mood and mood score (1-10) are required", 400);
  }

  const newCheckIn = await MoodCheckIn.create({
    userId: req.user._id,
    mood,
    moodScore,
    energyLevel: energyLevel !== undefined ? energyLevel : 5,
    stressLevel: stressLevel !== undefined ? stressLevel : 5,
    emotions: emotions || [],
    triggers: triggers || [],
    note,
    aiInsights,
    checkInTime: checkInTime || new Date(),
  });

  res.status(201).json({
    status: "success",
    message: "Mood check-in recorded successfully",
    data: {
      moodCheckIn: newCheckIn,
    },
  });
});

/**
 * @desc    Get all mood check-ins for the authenticated user (with filters & pagination)
 * @route   GET /api/moods
 * @access  Private
 */
export const getMoodCheckIns = asyncHandler(async (req, res) => {
  const {
    mood,
    startDate,
    endDate,
    page = 1,
    limit = 20,
    sortBy = "checkInTime",
    order = "desc",
  } = req.query;

  const query = { userId: req.user._id };

  if (mood) {
    query.mood = mood.toLowerCase();
  }

  // Filter by date range
  if (startDate || endDate) {
    query.checkInTime = {};
    if (startDate) query.checkInTime.$gte = new Date(startDate);
    if (endDate) query.checkInTime.$lte = new Date(endDate);
  }

  const pageNum = parseInt(page, 10) || 1;
  const limitNum = parseInt(limit, 10) || 20;
  const skip = (pageNum - 1) * limitNum;
  const sortOrder = order === "asc" ? 1 : -1;

  const [moodCheckIns, totalCheckIns] = await Promise.all([
    MoodCheckIn.find(query)
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(limitNum),
    MoodCheckIn.countDocuments(query),
  ]);

  res.status(200).json({
    status: "success",
    results: moodCheckIns.length,
    pagination: {
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(totalCheckIns / limitNum),
      totalCheckIns,
    },
    data: {
      moodCheckIns,
    },
  });
});

/**
 * @desc    Get latest mood check-in
 * @route   GET /api/moods/latest
 * @access  Private
 */
export const getLatestMoodCheckIn = asyncHandler(async (req, res) => {
  const latestCheckIn = await MoodCheckIn.findOne({ userId: req.user._id }).sort({
    checkInTime: -1,
  });

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
  const checkIn = await MoodCheckIn.findOne({
    _id: req.params.id,
    userId: req.user._id,
  });

  if (!checkIn) {
    throw new AppError("Mood check-in not found", 404);
  }

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
  const updatedCheckIn = await MoodCheckIn.findOneAndUpdate(
    { _id: req.params.id, userId: req.user._id },
    req.body,
    { new: true, runValidators: true }
  );

  if (!updatedCheckIn) {
    throw new AppError("Mood check-in not found", 404);
  }

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
  const checkIn = await MoodCheckIn.findOneAndDelete({
    _id: req.params.id,
    userId: req.user._id,
  });

  if (!checkIn) {
    throw new AppError("Mood check-in not found", 404);
  }

  res.status(200).json({
    status: "success",
    message: "Mood check-in deleted successfully",
  });
});

/**
 * @desc    Get mood analytics & insights (trends, averages, trigger correlations)
 * @route   GET /api/moods/analytics
 * @access  Private
 */
export const getMoodAnalytics = asyncHandler(async (req, res) => {
  const { days = 30 } = req.query;
  const daysNum = parseInt(days, 10) || 30;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - daysNum);

  const userId = req.user._id;

  const [averages, moodDistribution, commonTriggers, dailyTrends] =
    await Promise.all([
      // 1. Overall Averages
      MoodCheckIn.aggregate([
        { $match: { userId, checkInTime: { $gte: startDate } } },
        {
          $group: {
            _id: null,
            avgMood: { $avg: "$moodScore" },
            avgEnergy: { $avg: "$energyLevel" },
            avgStress: { $avg: "$stressLevel" },
            totalEntries: { $sum: 1 },
          },
        },
      ]),

      // 2. Mood Type Breakdown
      MoodCheckIn.aggregate([
        { $match: { userId, checkInTime: { $gte: startDate } } },
        { $group: { _id: "$mood", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),

      // 3. Top Triggers Breakdown
      MoodCheckIn.aggregate([
        { $match: { userId, checkInTime: { $gte: startDate } } },
        { $unwind: "$triggers" },
        { $group: { _id: "$triggers", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 },
      ]),

      // 4. Daily Trends for charts
      MoodCheckIn.aggregate([
        { $match: { userId, checkInTime: { $gte: startDate } } },
        {
          $group: {
            _id: {
              $dateToString: { format: "%Y-%m-%d", date: "$checkInTime" },
            },
            avgMoodScore: { $avg: "$moodScore" },
            avgEnergyLevel: { $avg: "$energyLevel" },
            avgStressLevel: { $avg: "$stressLevel" },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
    ]);

  const summary = averages[0] || {
    avgMood: 0,
    avgEnergy: 0,
    avgStress: 0,
    totalEntries: 0,
  };

  res.status(200).json({
    status: "success",
    data: {
      period: `Last ${daysNum} days`,
      summary: {
        totalEntries: summary.totalEntries,
        avgMood: parseFloat(summary.avgMood.toFixed(1)),
        avgEnergy: parseFloat(summary.avgEnergy.toFixed(1)),
        avgStress: parseFloat(summary.avgStress.toFixed(1)),
      },
      moodDistribution: moodDistribution.reduce(
        (acc, item) => ({ ...acc, [item._id]: item.count }),
        {}
      ),
      topTriggers: commonTriggers.map((item) => ({
        trigger: item._id,
        count: item.count,
      })),
      dailyTrends: dailyTrends.map((d) => ({
        date: d._id,
        avgMoodScore: parseFloat(d.avgMoodScore.toFixed(1)),
        avgEnergyLevel: parseFloat(d.avgEnergyLevel.toFixed(1)),
        avgStressLevel: parseFloat(d.avgStressLevel.toFixed(1)),
        entriesCount: d.count,
      })),
    },
  });
});
