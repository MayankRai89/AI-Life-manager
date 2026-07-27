const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user.model");

const ACCESS_TOKEN_EXPIRY = "15m";
const REFRESH_TOKEN_EXPIRY = "30d";

function signAccessToken(userId) {
  return jwt.sign({ id: userId }, process.env.JWT_ACCESS_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRY,
  });
}

function signRefreshToken(userId) {
  return jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRY,
  });
}

async function registerUser({ name, email, password, timezone }) {
  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    const err = new Error("An account with this email already exists");
    err.statusCode = 409;
    throw err;
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await User.create({
    name,
    email,
    passwordHash,
    timezone: timezone || "UTC",
    authProvider: "local",
  });

  const accessToken = signAccessToken(user._id);
  const refreshToken = signRefreshToken(user._id);

  return { user, accessToken, refreshToken };
}

async function loginUser({ email, password }) {
  const user = await User.findOne({ email: email.toLowerCase() }).select(
    "+passwordHash",
  );

  const invalidCredsError = () => {
    const err = new Error("Invalid email or password");
    err.statusCode = 401;
    return err;
  };

  if (!user || !user.passwordHash) throw invalidCredsError();

  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) throw invalidCredsError();

  user.lastLoginAt = new Date();
  await user.save();

  const accessToken = signAccessToken(user._id);
  const refreshToken = signRefreshToken(user._id);

  return { user, accessToken, refreshToken };
}

async function getUserById(userId) {
  const user = await User.findById(userId);
  if (!user) {
    const err = new Error("User not found");
    err.statusCode = 404;
    throw err;
  }
  return user;
}

async function refreshAccessToken(refreshToken) {
  if (!refreshToken) {
    const err = new Error("Refresh token is required");
    err.statusCode = 400;
    throw err;
  }

  let decoded;
  try {
    decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
  } catch (e) {
    const err = new Error("Invalid or expired refresh token");
    err.statusCode = 401;
    throw err;
  }

  const user = await User.findById(decoded.id);
  if (!user) {
    const err = new Error("User not found");
    err.statusCode = 404;
    throw err;
  }

  return {
    accessToken: signAccessToken(user._id),
    refreshToken: signRefreshToken(user._id),
  };
}

module.exports = {
  registerUser,
  loginUser,
  getUserById,
  refreshAccessToken,
};
