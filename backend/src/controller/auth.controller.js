import { generateToken } from "../services/auth.services.js";
import User from "../model/user.model.js";

const getCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000,
});

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

    if (!username || !name || !email || !password) {
      return res.status(400).json({
        status: "error",
        message:
          "Please provide all required fields: username, name, email, and password.",
      });
    }
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

    res.cookie("token", token, getCookieOptions());

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
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        status: "error",
        message: messages.join(", "),
      });
    }

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

    const loginIdentifier = identifier || username || email;

    if (!loginIdentifier || !password) {
      return res.status(400).json({
        status: "error",
        message: "Please provide your username/email and password.",
      });
    }

    const trimmedIdentifier = loginIdentifier.trim().toLowerCase();

    const user = await User.findOne({
      $or: [{ email: trimmedIdentifier }, { username: trimmedIdentifier }],
    }).select("+password");

    if (!user) {
      return res.status(401).json({
        status: "error",
        message: "Invalid credentials.",
      });
    }

    const isPasswordMatch = await user.comparePassword(password);
    if (!isPasswordMatch) {
      return res.status(401).json({
        status: "error",
        message: "Invalid credentials.",
      });
    }

    const token = generateToken(user._id);
    res.cookie("token", token, getCookieOptions());

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
 * @desc    Logout user and clear cookie
 * @route   POST /api/auth/logout
 * @access  Public
 */
export const logout = async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    });

    return res.status(200).json({
      status: "success",
      message: "Logged out successfully",
    });
  } catch (error) {
    console.error("Logout Error:", error);
    return res.status(500).json({
      status: "error",
      message: "Error during logout",
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
