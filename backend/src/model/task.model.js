import mongoose from "mongoose";

const subtaskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Subtask title is required"],
    trim: true,
    maxlength: [200, "Subtask title cannot exceed 200 characters"],
  },
  isCompleted: {
    type: Boolean,
    default: false,
  },
  completedAt: {
    type: Date,
  },
});

const taskSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
      index: true,
    },
    title: {
      type: String,
      required: [true, "Task title is required"],
      trim: true,
      minlength: [1, "Task title cannot be empty"],
      maxlength: [200, "Task title cannot exceed 200 characters"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [2000, "Description cannot exceed 2000 characters"],
    },
    category: {
      type: String,
      enum: {
        values: [
          "work",
          "personal",
          "health",
          "fitness",
          "study",
          "errand",
          "finance",
          "other",
        ],
        message: "{VALUE} is not a valid task category",
      },
      default: "personal",
      lowercase: true,
      index: true,
    },
    priority: {
      type: String,
      enum: {
        values: ["low", "medium", "high", "urgent"],
        message: "{VALUE} is not a valid priority level",
      },
      default: "medium",
      lowercase: true,
      index: true,
    },
    status: {
      type: String,
      enum: {
        values: ["pending", "in_progress", "completed", "archived", "cancelled"],
        message: "{VALUE} is not a valid task status",
      },
      default: "pending",
      lowercase: true,
      index: true,
    },
    dueDate: {
      type: Date,
      index: true,
    },
    dueTime: {
      type: String, // e.g., "14:30"
      trim: true,
    },
    // Estimated time in minutes
    estimatedDuration: {
      type: Number,
      min: [1, "Estimated duration must be at least 1 minute"],
    },
    // Actual time spent in minutes
    actualDuration: {
      type: Number,
      min: [0, "Actual duration cannot be negative"],
      default: 0,
    },
    // Subtasks / checklist items
    subtasks: [subtaskSchema],
    // Recurrence rules
    recurrence: {
      isRecurring: {
        type: Boolean,
        default: false,
      },
      frequency: {
        type: String,
        enum: ["daily", "weekly", "weekdays", "monthly", "custom"],
      },
      interval: {
        type: Number,
        default: 1,
      },
      daysOfWeek: [
        {
          type: String,
          enum: ["mon", "tue", "wed", "thu", "fri", "sat", "sun"],
        },
      ],
      endDate: {
        type: Date,
      },
    },
    // Reminders (e.g., minutes before due date)
    reminders: [
      {
        minutesBefore: Number,
        remindAt: Date,
        isSent: { type: Boolean, default: false },
      },
    ],
    // Tags for filtering
    tags: [
      {
        type: String,
        trim: true,
        lowercase: true,
      },
    ],
    // AI Features & smart scheduling
    aiMetadata: {
      isAiSuggested: {
        type: Boolean,
        default: false,
      },
      aiSuggestionReason: {
        type: String,
        trim: true,
      },
      energyFit: {
        type: String,
        enum: ["low_energy", "medium_energy", "high_energy"],
        default: "medium_energy",
      },
      optimalTimeSlot: {
        start: String, // e.g. "09:00"
        end: String, // e.g. "10:30"
      },
    },
    completedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Auto set completedAt timestamp when status changes to completed
taskSchema.pre("save", function () {
  if (this.isModified("status")) {
    if (this.status === "completed" && !this.completedAt) {
      this.completedAt = new Date();
    } else if (this.status !== "completed") {
      this.completedAt = null;
    }
  }
});

// Compound indexes for optimal query performance
taskSchema.index({ userId: 1, status: 1, dueDate: 1 });
taskSchema.index({ userId: 1, priority: 1 });
taskSchema.index({ userId: 1, category: 1 });

const Task = mongoose.model("Task", taskSchema);

export default Task;
export { Task, taskSchema };
