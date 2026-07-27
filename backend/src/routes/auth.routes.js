const express = require("express");
const router = express.Router();

const authController = require("../controllers/auth.controllers");
const authMiddleware = require("../services/auth.middleware");
const validate = require("../middleware/validate.middleware");
const {
  registerSchema,
  loginSchema,
} = require("../utils/authValidationSchemas");

// @route   POST /api/auth/register
// @desc    Create a new user account
// @access  Public
router.post("/register", validate(registerSchema), authController.register);

// @route   POST /api/auth/login
// @desc    Authenticate user and return JWT
// @access  Public
router.post("/login", validate(loginSchema), authController.login);

// @route   POST /api/auth/logout
// @desc    Logout user (client discards token; endpoint kept for future token-blacklisting)
// @access  Private
router.post("/logout", authMiddleware, authController.logout);

// @route   GET /api/auth/me
// @desc    Get the currently logged-in user's profile
// @access  Private
router.get("/me", authMiddleware, authController.getMe);

// @route   POST /api/auth/refresh
// @desc    Issue a new access token using a valid refresh token
// @access  Public (requires valid refresh token in body)
router.post("/refresh", authController.refresh);

module.exports = router;
