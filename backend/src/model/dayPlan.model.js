import mongoose from "mongoose";

const focusTaskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    action: {
      type: String,
      trim: true,
      default: "",
    },
    reason: {
      type: String,
      trim: true,
      default: "",
    },
    timeSlot: {
      type: String,
      trim: true,
      default: "",
    },
  },
  { _id: false }
);

const wellnessActivitySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    type: {
      type: String,
      enum: ["rest", "move", "hydrate", "eat", "other"],
      default: "rest",
    },
  },
  { _id: false }
);

const dayPlanSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
      index: true,
    },
    moodCheckInId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MoodCheckIn",
      required: [true, "MoodCheckIn ID is required"],
      index: true,
    },
    date: {
      type: String, // "YYYY-MM-DD"
      required: true,
      index: true,
    },
    moodSnapshot: {
      mood: String,
      moodScore: Number,
      energyLevel: Number,
      stressLevel: Number,
      checkInTime: Date,
      time: String,
    },
    requestedAt: {
      type: Date,
      default: Date.now,
    },
    summary: {
      type: String,
      required: [true, "Plan summary is required"],
      trim: true,
    },
    orderedTaskIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Task",
      },
    ],
    focusTasks: [focusTaskSchema],
    wellnessActivities: [wellnessActivitySchema],
    notes: {
      type: String,
      trim: true,
      default: "",
    },
    provider: {
      type: String,
      default: "ai",
    },
  },
  {
    timestamps: true,
  }
);

// Fast compound index for user + mood check-in lookups
dayPlanSchema.index({ userId: 1, moodCheckInId: 1 }, { unique: true });
dayPlanSchema.index({ userId: 1, date: 1 });

const DayPlan = mongoose.model("DayPlan", dayPlanSchema);

export default DayPlan;
export { DayPlan, dayPlanSchema };
