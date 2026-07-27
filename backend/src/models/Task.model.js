const mongoose = require("mongoose");
const { Schema } = mongoose;

const TaskSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 2000,
      default: "",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    status: {
      type: String,
      enum: ["pending", "in_progress", "done"],
      default: "pending",
    },
    dueDate: {
      type: Date,
      default: null,
    },
    category: {
      type: String,
      trim: true,
      default: "general",
    },
    linkedMoodCheckinId: {
      type: Schema.Types.ObjectId,
      ref: "MoodCheckin",
      default: null,
    },
    completedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
);

TaskSchema.index({ userId: 1, status: 1, dueDate: 1 });

module.exports = mongoose.model("Task", TaskSchema);
