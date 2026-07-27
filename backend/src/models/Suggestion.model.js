const mongoose = require("mongoose");
const { Schema } = mongoose;

const SuggestionSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    moodCheckinId: {
      type: Schema.Types.ObjectId,
      ref: "MoodCheckin",
      required: true,
    },
    type: {
      type: String,
      enum: ["music", "exercise", "breathing", "journaling", "social"],
      required: true,
    },
    content: {
      title: { type: String, required: true },
      description: { type: String, default: "" },
      externalUrl: { type: String, default: null },
    },
    userResponse: {
      type: String,
      enum: ["pending", "accepted", "dismissed", "helpful", "not_helpful"],
      default: "pending",
    },
    respondedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
);

SuggestionSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model("Suggestion", SuggestionSchema);
