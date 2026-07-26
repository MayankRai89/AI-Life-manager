const mongoose = require("mongoose");
const { Schema } = mongoose;

const MoodCheckinSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    mood: {
      type: String,
      required: true,
      enum: [
        "happy",
        "calm",
        "anxious",
        "sad",
        "stressed",
        "energetic",
        "tired",
        "angry",
        "neutral",
      ],
    },
    moodScore: {
      type: Number,
      max: 10,
      required: true,
    },
    energyLevel: {
      type: Number,
      min: 1,
      max: 10,
      required: true,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: "",
    },
    tags: {
      type: [String],
      default: [],
    },
    checkinAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  { timestamps: true },
);

MoodCheckinSchema.index({ userId: 1, checkinAt: -1 });

module.exports = mongoose.model("MoodCheckin", MoodCheckinSchema);
