import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "ai_life_manager_secret_key_2026";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";
const SALT_ROUNDS = 10;

/**
 * Hash a plain text password using bcrypt
 * @param {string} password - Plain text password
 * @returns {Promise<string>} - Hashed password
 */
export const hashPassword = async (password) => {
  if (!password) {
    throw new Error("Password is required for hashing");
  }
  const salt = await bcrypt.genSalt(SALT_ROUNDS);
  return await bcrypt.hash(password, salt);
};

/**
 * Compare plain text password with hashed password
 * @param {string} candidatePassword - Plain text candidate password
 * @param {string} hashedPassword - Hashed password stored in DB
 * @returns {Promise<boolean>} - True if passwords match, false otherwise
 */
export const comparePassword = async (candidatePassword, hashedPassword) => {
  if (!candidatePassword || !hashedPassword) {
    return false;
  }
  return await bcrypt.compare(candidatePassword, hashedPassword);
};

/**
 * Generate/Sign a JWT token
 * @param {object|string} payload - Payload to embed (e.g. userId or { id, role })
 * @param {string} [expiresIn] - Optional custom expiration (e.g. "7d", "24h")
 * @returns {string} - Signed JWT token
 */
export const generateToken = (payload, expiresIn = JWT_EXPIRES_IN) => {
  let tokenPayload;

  // Handle Mongoose ObjectId or string / primitive IDs
  if (
    typeof payload === "string" ||
    typeof payload === "number" ||
    (payload && payload.constructor && payload.constructor.name === "ObjectId")
  ) {
    tokenPayload = { id: payload.toString() };
  } else if (payload && typeof payload === "object" && !(payload instanceof Buffer)) {
    // If it's already an object (e.g. { id: user._id }), ensure id is stringified if ObjectId
    tokenPayload = { ...payload };
    if (tokenPayload.id && typeof tokenPayload.id !== "string") {
      tokenPayload.id = tokenPayload.id.toString();
    }
  } else {
    tokenPayload = { id: String(payload) };
  }

  return jwt.sign(tokenPayload, JWT_SECRET, {
    expiresIn: expiresIn || "7d",
  });
};

/**
 * Verify a JWT token
 * @param {string} token - JWT token string
 * @returns {object} - Decoded payload if valid
 * @throws {Error} - If token is invalid or expired
 */
export const verifyToken = (token) => {
  if (!token) {
    throw new Error("No token provided");
  }
  return jwt.verify(token, JWT_SECRET);
};

export default {
  hashPassword,
  comparePassword,
  generateToken,
  verifyToken,
};
