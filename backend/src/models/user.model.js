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
        // Not required if user signed up via OAuth (Google/Apple)
        return !this.authProvider || this.authProvider === "local";
      },
    },
    authProvider: {
      type: String,
      enum: ["local", "google", "apple"],
      default: "local",
    },
    authProviderId: {
      type: String, // external ID from Google/Apple, if applicable
      default: null,
    },
    timezone: {
      type: String,
      default: "UTC", // e.g. "Asia/Kolkata" — critical for reminder firing times
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
    isActive: {
      type: Boolean,
      default: true, // supports soft-delete / account deactivation
    },
    lastLoginAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }, // adds createdAt, updatedAt automatically
);

// Never return passwordHash when converting to JSON (e.g. in API responses)
UserSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.passwordHash;
  return obj;
};

module.exports = mongoose.model("User", UserSchema);
