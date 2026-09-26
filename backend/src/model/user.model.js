import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "Username is required"],
      unique: true,
      trim: true,
      lowercase: true,
      minlength: [3, "Username must be at least 3 characters long"],
      maxlength: [30, "Username cannot exceed 30 characters"],
      match: [
        /^[a-zA-Z0-9_.-]+$/,
        "Username can only contain alphanumeric characters, dots, underscores, and dashes",
      ],
      index: true,
    },
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters long"],
      maxlength: [50, "Name cannot exceed 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please provide a valid email address",
      ],
      index: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters long"],
      select: false,
    },
    phoneNumber: {
      type: String,
      trim: true,
      match: [
        /^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]*$/,
        "Please provide a valid phone number",
      ],
    },
    age: {
      type: Number,
      min: [1, "Age must be at least 1"],
      max: [120, "Age cannot exceed 120"],
    },
    gender: {
      type: String,
      enum: {
        values: ["male", "female", "other", "prefer_not_to_say"],
        message: "{VALUE} is not a valid gender option",
      },
      lowercase: true,
      default: "prefer_not_to_say",
    },
    timezone: {
      type: String,
      default: "UTC",
      trim: true,
    },

    schedule: {
      wakeTime: {
        type: String,
        default: "07:00",
      },
      sleepTime: {
        type: String,
        default: "23:00",
      },
      workingHours: {
        start: {
          type: String,
          default: "09:00",
        },
        end: {
          type: String,
          default: "18:00",
        },
      },
    },

    medicalReport: {
      conditions: [{ type: String, trim: true }],
      allergies: [{ type: String, trim: true }],
      medications: [{ type: String, trim: true }],
      notes: { type: String, trim: true },
      documents: [
        {
          title: String,
          fileUrl: String,
          uploadedAt: { type: Date, default: Date.now },
        },
      ],
    },
  },
  {
    timestamps: true,
  },
);

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model("User", userSchema);

export default User;
export { User, userSchema };
