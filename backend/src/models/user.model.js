const mongoose = require("mongoose");
const { Schema } = mongoose;

const UserSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/.+@.+\..+/, "Please enter a valid email"],
    },
    passwordHash: {
      type: String,
      required: function () {
        return !this.authProvider || this.authProvider === "local";
      },
    },
    authProvider: {
      type: String,
      enum: ["local", "google", "apple"],
      default: "local",
    },
    authProviderId: {
      type: String,
      default: null,
    },
    timezone: {
      type: String,
      default: "UTC",
    },
    preferences: {
      preferredSuggestionTypes: {
        type: [String],
        enum: ["music", "exercise", "breathing", "journaling", "social"],
        default: ["music", "exercise", "breathing"],
      },
      notificationsEnabled: {
        type: Boolean,
        default: true,
      },
      theme: {
        type: String,
        enum: ["light", "dark", "system"],
        default: "system",
      },
    },
    healthProfile: {
      bloodGroup: { type: String, default: "" },
      allergies: [{ type: String }],
      conditions: [{ type: String }],
      latestMetrics: {
        type: Map,
        of: new Schema(
          {
            value: String,
            unit: String,
            status: String,
            updatedAt: { type: Date, default: Date.now },
          },
          { _id: false },
        ),
        default: {},
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLoginAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
);
UserSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.passwordHash;
  return obj;
};

module.exports = mongoose.model("AI-Assistant", UserSchema);
