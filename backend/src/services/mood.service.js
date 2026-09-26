import MoodCheckIn from "../model/moodCheckins.model.js";
import { AppError } from "../middleware/errorHandler.middleware.js";

/**
 * Record a new mood check-in
 */
export const createMoodCheckIn = async (userId, moodData) => {
  const { mood, moodScore } = moodData;

  if (!mood || moodScore === undefined) {
    throw new AppError("Mood and mood score (1-10) are required", 400);
  }

  return await MoodCheckIn.create({
    userId,
    ...moodData,
    energyLevel: moodData.energyLevel !== undefined ? moodData.energyLevel : 5,
    stressLevel: moodData.stressLevel !== undefined ? moodData.stressLevel : 5,
    checkInTime: moodData.checkInTime || new Date(),
  });
};

/**
 * Get all mood check-ins for a user with filters & pagination
 */
export const getMoodCheckIns = async (userId, options = {}) => {
  const {
    mood,
    startDate,
    endDate,
    page = 1,
    limit = 20,
    sortBy = "checkInTime",
    order = "desc",
  } = options;

  const query = { userId };

  if (mood) {
    query.mood = mood.toLowerCase();
  }

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

  return {
    moodCheckIns,
    pagination: {
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(totalCheckIns / limitNum),
      totalCheckIns,
    },
  };
};

/**
 * Get the latest mood check-in for a user
 */
export const getLatestMoodCheckIn = async (userId) => {
  return await MoodCheckIn.findOne({ userId }).sort({ checkInTime: -1 });
};

/**
 * Get a specific mood check-in by ID
 */
export const getMoodCheckInById = async (userId, checkInId) => {
  const checkIn = await MoodCheckIn.findOne({ _id: checkInId, userId });
  if (!checkIn) {
    throw new AppError("Mood check-in not found", 404);
  }
  return checkIn;
};

/**
 * Update a mood check-in by ID
 */
export const updateMoodCheckIn = async (userId, checkInId, updateData) => {
  const checkIn = await MoodCheckIn.findOneAndUpdate(
    { _id: checkInId, userId },
    updateData,
    { new: true, runValidators: true }
  );

  if (!checkIn) {
    throw new AppError("Mood check-in not found", 404);
  }
  return checkIn;
};

/**
 * Delete a mood check-in by ID
 */
export const deleteMoodCheckIn = async (userId, checkInId) => {
  const checkIn = await MoodCheckIn.findOneAndDelete({ _id: checkInId, userId });
  if (!checkIn) {
    throw new AppError("Mood check-in not found", 404);
  }
  return true;
};

/**
 * Get mood analytics & aggregations for a specified time period
 */
export const getMoodAnalytics = async (userId, days = 30) => {
  const daysNum = parseInt(days, 10) || 30;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - daysNum);

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

      // 4. Daily Trends
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

  return {
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
  };
};

export default {
  createMoodCheckIn,
  getMoodCheckIns,
  getLatestMoodCheckIn,
  getMoodCheckInById,
  updateMoodCheckIn,
  deleteMoodCheckIn,
  getMoodAnalytics,
};
