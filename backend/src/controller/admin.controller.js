import crypto from "crypto";
import DayPlan from "../model/dayPlan.model.js";
import MoodCheckIn from "../model/moodCheckIns.model.js";
import asyncHandler from "../utils/asyncHandler.js";

/**
 * Derives an anonymized 8-character ID from userId and JWT_SECRET using HMAC-SHA256.
 * Guarantees zero leakage of raw userId or user identity.
 */
const getAnonId = (userId) => {
  const secret = process.env.JWT_SECRET || "fallback_secret";
  return crypto
    .createHmac("sha256", secret)
    .update(String(userId || ""))
    .digest("hex")
    .slice(0, 8);
};

/**
 * @desc    Get paginated day plan feedback items (read-only)
 * @route   GET /api/admin/feedback
 * @access  Private (Admin only)
 */
export const getFeedback = asyncHandler(async (req, res) => {
  const { rating, provider, promptVersion } = req.query;
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 20, 1), 50);
  const skip = (page - 1) * limit;

  // Base match condition: only plans that have a user feedback rating
  const matchConditions = [
    {
      $or: [
        { "userFeedback.rating": { $in: ["up", "down"] } },
        { "feedback.rating": { $in: ["up", "down"] } },
      ],
    },
  ];

  if (rating && (rating === "up" || rating === "down")) {
    matchConditions.push({
      $or: [
        { "userFeedback.rating": rating },
        { "feedback.rating": rating },
      ],
    });
  }

  if (provider && typeof provider === "string" && provider.trim()) {
    matchConditions.push({
      $or: [
        { providerUsed: provider.trim() },
        { provider: provider.trim() },
      ],
    });
  }

  if (promptVersion && typeof promptVersion === "string" && promptVersion.trim()) {
    matchConditions.push({
      promptVersion: promptVersion.trim(),
    });
  }

  const pipeline = [
    {
      $match: {
        $and: matchConditions,
      },
    },
    // Lookup MoodCheckIn to extract capacityLevel
    {
      $lookup: {
        from: MoodCheckIn.collection.name,
        localField: "moodCheckInId",
        foreignField: "_id",
        as: "moodCheckInDoc",
      },
    },
    {
      $addFields: {
        moodCheckIn: { $arrayElemAt: ["$moodCheckInDoc", 0] },
        effectiveRating: {
          $ifNull: ["$userFeedback.rating", "$feedback.rating"],
        },
        effectiveRatedAt: {
          $ifNull: ["$userFeedback.ratedAt", { $ifNull: ["$feedback.ratedAt", "$updatedAt"] }],
        },
        effectiveReason: {
          $ifNull: ["$userFeedback.reason", { $ifNull: ["$feedback.reason", ""] }],
        },
        effectiveProvider: {
          $ifNull: ["$providerUsed", { $ifNull: ["$provider", "unknown"] }],
        },
        effectivePromptVersion: {
          $ifNull: ["$promptVersion", "v0"],
        },
        effectiveMood: {
          $ifNull: ["$moodSnapshot.mood", { $ifNull: ["$moodCheckIn.mood", "neutral"] }],
        },
        ratingPriority: {
          $cond: [
            {
              $eq: [
                { $ifNull: ["$userFeedback.rating", "$feedback.rating"] },
                "down",
              ],
            },
            0,
            1,
          ],
        },
      },
    },
    {
      $addFields: {
        effectiveCapacityLevel: {
          $ifNull: [
            "$moodCheckIn.capacityLevel",
            { $ifNull: ["$moodSnapshot.capacityLevel", "normal"] },
          ],
        },
      },
    },
    // Sort: thumbs-down first when no rating filter is given, ratedAt descending
    {
      $sort: rating
        ? { effectiveRatedAt: -1 }
        : { ratingPriority: 1, effectiveRatedAt: -1 },
    },
    {
      $facet: {
        metadata: [{ $count: "total" }],
        data: [
          { $skip: skip },
          { $limit: limit },
          {
            $project: {
              _id: 0,
              userId: 1, // Retained temporarily to compute anonId in JS, stripped before response
              rating: "$effectiveRating",
              reason: "$effectiveReason",
              ratedAt: "$effectiveRatedAt",
              mood: "$effectiveMood",
              capacityLevel: "$effectiveCapacityLevel",
              providerUsed: "$effectiveProvider",
              promptVersion: "$effectivePromptVersion",
              summary: "$summary",
              date: "$date",
            },
          },
        ],
      },
    },
  ];

  const [result] = await DayPlan.aggregate(pipeline);
  const total = result?.metadata[0]?.total || 0;
  const rawData = result?.data || [];

  // Strictly sanitize output and map to anonymized ID
  const items = rawData.map((doc) => ({
    anonId: getAnonId(doc.userId),
    rating: doc.rating,
    reason: doc.reason || "",
    ratedAt: doc.ratedAt,
    mood: doc.mood || "neutral",
    capacityLevel: doc.capacityLevel || "normal",
    providerUsed: doc.providerUsed || "unknown",
    promptVersion: doc.promptVersion || "v0",
    summary: doc.summary || "",
    date: doc.date || "",
  }));

  res.status(200).json({
    status: "success",
    data: {
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    },
  });
});

/**
 * @desc    Get aggregated plan and feedback metrics across providers, mood, and capacity
 * @route   GET /api/admin/stats
 * @access  Private (Admin only)
 */
export const getStats = asyncHandler(async (req, res) => {
  const days = Math.min(Math.max(parseInt(req.query.days, 10) || 30, 1), 90);
  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  const startDateStr = startDate.toISOString().split("T")[0];

  // Match condition for plans rated within the days timeframe
  const ratedMatchConditions = {
    $and: [
      {
        $or: [
          { "userFeedback.rating": { $in: ["up", "down"] } },
          { "feedback.rating": { $in: ["up", "down"] } },
        ],
      },
      {
        $or: [
          { "userFeedback.ratedAt": { $gte: startDate } },
          { "feedback.ratedAt": { $gte: startDate } },
        ],
      },
    ],
  };

  // Count total plans generated within the timeframe
  const totalPlansCount = await DayPlan.countDocuments({
    $or: [
      { requestedAt: { $gte: startDate } },
      { createdAt: { $gte: startDate } },
      { date: { $gte: startDateStr } },
    ],
  });

  const pipeline = [
    { $match: ratedMatchConditions },
    {
      $lookup: {
        from: MoodCheckIn.collection.name,
        localField: "moodCheckInId",
        foreignField: "_id",
        as: "moodCheckInDoc",
      },
    },
    {
      $addFields: {
        moodCheckIn: { $arrayElemAt: ["$moodCheckInDoc", 0] },
        rating: { $ifNull: ["$userFeedback.rating", "$feedback.rating"] },
        provider: {
          $ifNull: ["$providerUsed", { $ifNull: ["$provider", "unknown"] }],
        },
        promptVersionKey: { $ifNull: ["$promptVersion", "v0"] },
        moodKey: {
          $ifNull: ["$moodSnapshot.mood", { $ifNull: ["$moodCheckIn.mood", "neutral"] }],
        },
      },
    },
    {
      $addFields: {
        capacityKey: {
          $ifNull: [
            "$moodCheckIn.capacityLevel",
            { $ifNull: ["$moodSnapshot.capacityLevel", "normal"] },
          ],
        },
        dayKey: {
          $ifNull: ["$date", "unknown"],
        },
      },
    },
    {
      $facet: {
        overview: [
          {
            $group: {
              _id: null,
              ratedPlans: { $sum: 1 },
              upCount: {
                $sum: { $cond: [{ $eq: ["$rating", "up"] }, 1, 0] },
              },
              downCount: {
                $sum: { $cond: [{ $eq: ["$rating", "down"] }, 1, 0] },
              },
            },
          },
        ],
        byProvider: [
          {
            $group: {
              _id: "$provider",
              up: { $sum: { $cond: [{ $eq: ["$rating", "up"] }, 1, 0] } },
              down: { $sum: { $cond: [{ $eq: ["$rating", "down"] }, 1, 0] } },
              total: { $sum: 1 },
            },
          },
          { $sort: { total: -1 } },
        ],
        byMood: [
          {
            $group: {
              _id: "$moodKey",
              up: { $sum: { $cond: [{ $eq: ["$rating", "up"] }, 1, 0] } },
              down: { $sum: { $cond: [{ $eq: ["$rating", "down"] }, 1, 0] } },
              total: { $sum: 1 },
            },
          },
          { $sort: { total: -1 } },
        ],
        byCapacityLevel: [
          {
            $group: {
              _id: "$capacityKey",
              up: { $sum: { $cond: [{ $eq: ["$rating", "up"] }, 1, 0] } },
              down: { $sum: { $cond: [{ $eq: ["$rating", "down"] }, 1, 0] } },
              total: { $sum: 1 },
            },
          },
          { $sort: { total: -1 } },
        ],
        byPromptVersion: [
          {
            $group: {
              _id: "$promptVersionKey",
              up: { $sum: { $cond: [{ $eq: ["$rating", "up"] }, 1, 0] } },
              down: { $sum: { $cond: [{ $eq: ["$rating", "down"] }, 1, 0] } },
              total: { $sum: 1 },
            },
          },
          { $sort: { _id: 1 } },
        ],
        byDay: [
          {
            $group: {
              _id: "$dayKey",
              up: { $sum: { $cond: [{ $eq: ["$rating", "up"] }, 1, 0] } },
              down: { $sum: { $cond: [{ $eq: ["$rating", "down"] }, 1, 0] } },
              total: { $sum: 1 },
            },
          },
          { $sort: { _id: 1 } },
        ],
      },
    },
  ];

  const [statsResult] = await DayPlan.aggregate(pipeline);

  const overview = statsResult?.overview[0] || {
    ratedPlans: 0,
    upCount: 0,
    downCount: 0,
  };

  const ratedPlans = overview.ratedPlans || 0;
  const upCount = overview.upCount || 0;
  const downCount = overview.downCount || 0;
  const totalPlans = Math.max(totalPlansCount, ratedPlans);

  const formatBreakdown = (list = []) =>
    list.map((item) => ({
      key: String(item._id || "unknown"),
      up: item.up || 0,
      down: item.down || 0,
      total: item.total || 0,
    }));

  res.status(200).json({
    status: "success",
    data: {
      totalPlans,
      ratedPlans,
      upCount,
      downCount,
      byProvider: formatBreakdown(statsResult?.byProvider),
      byMood: formatBreakdown(statsResult?.byMood),
      byCapacityLevel: formatBreakdown(statsResult?.byCapacityLevel),
      byPromptVersion: formatBreakdown(statsResult?.byPromptVersion),
      byDay: formatBreakdown(statsResult?.byDay),
    },
  });
});
