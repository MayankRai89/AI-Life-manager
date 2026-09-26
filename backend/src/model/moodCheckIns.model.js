import mongoose from "mongoose";

const moodCheckInSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
      index: true,
    },
    mood: {
      type: String,
      required: [true, "Mood is required"],
      enum: {
        values: [
          "happy",
          "excited",
          "grateful",
          "calm",
          "neutral",
          "tired",
          "anxious",
          "stressed",
          "sad",
          "angry",
          "overwhelmed",
        ],
        message: "{VALUE} is not a valid mood",
      },
      lowercase: true,
      trim: true,
    },
    moodScore: {
      type: Number,
      required: [true, "Mood score is required"],
      min: [1, "Mood score cannot be less than 1"],
      max: [10, "Mood score cannot be greater than 10"],
    },
    energyLevel: {
      type: Number,
      min: [1, "Energy level cannot be less than 1"],
      max: [10, "Energy level cannot be greater than 10"],
      default: 5,
    },
    stressLevel: {
      type: Number,
      min: [1, "Stress level cannot be less than 1"],
      max: [10, "Stress level cannot be greater than 10"],
      default: 5,
    },
    emotions: [
      {
        type: String,
        trim: true,
        lowercase: true,
      },
    ],
    triggers: [
      {
        type: String,
        trim: true,
        lowercase: true,
      },
    ],
    note: {
      type: String,
      trim: true,
      maxlength: [1000, "Note cannot exceed 1000 characters"],
    },
    aiInsights: {
      sentiment: {
        type: String,
        enum: ["positive", "neutral", "negative"],
      },
      summary: {
        type: String,
        trim: true,
      },
      suggestedAction: {
        type: String,
        trim: true,
      },
      analyzedAt: {
        type: Date,
      },
    },
    checkInTime: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

moodCheckInSchema.index({ userId: 1, checkInTime: -1 });

const MoodCheckIn = mongoose.model("MoodCheckIn", moodCheckInSchema);

export default MoodCheckIn;
export { MoodCheckIn, moodCheckInSchema };
