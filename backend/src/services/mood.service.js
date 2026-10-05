import MoodCheckIn from "../model/moodCheckIns.model.js";
import { AppError } from "../middleware/errorHandler.middleware.js";
import logger from "../utils/Logger.js";
import { getDerivedContext } from "./ai/ai.service.js";

/**
 * Record a new mood check-in
 */
export const createMoodCheckIn = async (userId, moodData) => {
  const { mood, moodScore } = moodData;

  if (!mood || moodScore === undefined) {
    throw new AppError("Mood and mood score (1-10) are required", 400);
  }

  const checkInDate = moodData.checkInTime
    ? new Date(moodData.checkInTime)
    : new Date();

  const checkIn = await MoodCheckIn.create({
    userId,
    ...moodData,
    energyLevel: moodData.energyLevel !== undefined ? moodData.energyLevel : 5,
    stressLevel: moodData.stressLevel !== undefined ? moodData.stressLevel : 5,
    capacityLevel: moodData.capacityLevel || "normal",
    checkInTime: checkInDate,
    timeZone: moodData.timeZone || "UTC",
  });

  // Fire-and-forget: extract derived context from free-text note.
  // Never blocks the response — failures are logged only.
  if (checkIn.note && checkIn.note.trim()) {
    getDerivedContext(checkIn.note)
      .then(async (derivedContext) => {
        if (derivedContext) {
          await MoodCheckIn.findByIdAndUpdate(checkIn._id, { derivedContext });
        }
      })
      .catch((err) =>
        logger.warn(`[MoodService] derivedContext update failed for ${checkIn._id}: ${err.message}`)
      );
  }

  return checkIn;
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
    cursor,
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
  const limitNum = Math.min(parseInt(limit, 10) || 20, 100);
  const sortOrder = order === "asc" ? 1 : -1;

  if (cursor) {
    query._id = sortOrder === 1 ? { $gt: cursor } : { $lt: cursor };
  }
  const skip = cursor ? 0 : (pageNum - 1) * limitNum;

  const [moodCheckIns, totalCheckIns] = await Promise.all([
    MoodCheckIn.find(query)
      .sort(cursor ? { _id: sortOrder } : { [sortBy]: sortOrder })
      .skip(skip)
      .limit(limitNum)
      .lean(),
    MoodCheckIn.countDocuments(query),
  ]);

  const nextCursor =
    moodCheckIns.length === limitNum
      ? moodCheckIns[moodCheckIns.length - 1]._id
      : null;

  return {
    moodCheckIns,
    pagination: {
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(totalCheckIns / limitNum),
      totalCheckIns,
      nextCursor,
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
    { returnDocument: "after", runValidators: true }
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
