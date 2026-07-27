const mongoose = require("mongoose");
const { Schema } = mongoose;

const ReminderSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    label: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: 500,
      default: "",
    },
    scheduleType: {
      type: String,
      enum: ["one_time", "daily", "weekly", "custom_days"],
      required: true,
    },
    time: {
      type: String,
      required: true,
      match: [/^([01]\d|2[0-3]):([0-5]\d)$/, "time must be in HH:mm format"],
    },
    daysOfWeek: {
      type: [Number],
      default: [],
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    endDate: {
      type: Date,
      default: null,
    },
    isEnabled: {
      type: Boolean,
      default: true,
    },
    lastFiredAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
);

ReminderSchema.index({ userId: 1, isEnabled: 1 });

module.exports = mongoose.model("Reminder", ReminderSchema);
