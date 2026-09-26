import jwt from "jsonwebtoken";
import User from "../model/user.model.js";

const JWT_SECRET = process.env.JWT_SECRET || "ai_life_manager_secret_key_2026";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

/**
 * Generate JWT token for user
 */
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
};

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
export const register = async (req, res) => {
  try {
    const {
      username,
      name,
      email,
      password,
      phoneNumber,
      age,
      gender,
      timezone,
      schedule,
      medicalReport,
    } = req.body;

    // Required fields check
    if (!username || !name || !email || !password) {
      return res.status(400).json({
        status: "error",
        message: "Please provide all required fields: username, name, email, and password.",
      });
    }

    // Check if user already exists with username or email
    const existingUser = await User.findOne({
      $or: [
        { email: email.toLowerCase() },
        { username: username.toLowerCase() },
      ],
    });

    if (existingUser) {
      if (existingUser.email.toLowerCase() === email.toLowerCase()) {
        return res.status(409).json({
          status: "error",
          message: "A user with this email already exists.",
        });
      }
      if (existingUser.username.toLowerCase() === username.toLowerCase()) {
        return res.status(409).json({
          status: "error",
          message: "A user with this username already exists.",
        });
      }
    }

    // Create new user
    const newUser = await User.create({
      username,
      name,
      email,
      password,
      phoneNumber,
      age,
      gender,
      timezone: timezone || "UTC",
      schedule: schedule || {},
      medicalReport: medicalReport || {},
    });

    const token = generateToken(newUser._id);

    // Prepare user response without password
    const userResponse = newUser.toObject();
    delete userResponse.password;

    return res.status(201).json({
      status: "success",
      message: "User registered successfully",
      token,
      data: {
        user: userResponse,
      },
    });
  } catch (error) {
    // Handle Mongoose validation errors
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        status: "error",
        message: messages.join(", "),
      });
    }

    // Handle Mongo duplicate key error
    if (error.code === 11000) {
      const duplicateField = Object.keys(error.keyPattern || {})[0] || "field";
      return res.status(409).json({
        status: "error",
        message: `An account with this ${duplicateField} already exists.`,
      });
    }

    console.error("Register Error:", error);
    return res.status(500).json({
      status: "error",
      message: "An error occurred during registration. Please try again later.",
    });
  }
};

/**
 * @desc    Login user with username/email and password
 * @route   POST /api/auth/login
 * @access  Public
 */
export const login = async (req, res) => {
  try {
    const { identifier, username, email, password } = req.body;

    // Login identifier can be passed as `identifier`, `username`, or `email`
    const loginIdentifier = identifier || username || email;

    if (!loginIdentifier || !password) {
      return res.status(400).json({
        status: "error",
        message: "Please provide your username/email and password.",
      });
    }

    const trimmedIdentifier = loginIdentifier.trim().toLowerCase();

    // Query user by email OR username (case-insensitive) & explicitly select password
    const user = await User.findOne({
      $or: [
        { email: trimmedIdentifier },
        { username: trimmedIdentifier },
      ],
    }).select("+password");

    if (!user) {
      return res.status(401).json({
        status: "error",
        message: "Invalid credentials.",
      });
    }

    // Verify password
    const isPasswordMatch = await user.comparePassword(password);
    if (!isPasswordMatch) {
      return res.status(401).json({
        status: "error",
        message: "Invalid credentials.",
      });
    }

    const token = generateToken(user._id);

    // Convert user doc to object and omit password
    const userResponse = user.toObject();
    delete userResponse.password;

    return res.status(200).json({
      status: "success",
      message: "Logged in successfully",
      token,
      data: {
        user: userResponse,
      },
    });
  } catch (error) {
    console.error("Login Error:", error);
    return res.status(500).json({
      status: "error",
      message: "An error occurred during login. Please try again later.",
    });
  }
};

/**
 * @desc    Get current logged in user profile
 * @route   GET /api/auth/me
 * @access  Private
 */
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    return res.status(200).json({
      status: "success",
      data: {
        user,
      },
    });
  } catch (error) {
    console.error("GetMe Error:", error);
    return res.status(500).json({
      status: "error",
      message: "Error fetching user profile",
    });
  }
};
