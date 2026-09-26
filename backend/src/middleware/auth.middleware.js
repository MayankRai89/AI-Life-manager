import jwt from "jsonwebtoken";
import User from "../model/user.model.js";

const JWT_SECRET = process.env.JWT_SECRET;

/**
 * Protect routes - verifies Bearer token in headers or cookies
 */
export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return res.status(401).json({
      status: "error",
      message: "Not authorized to access this route. No token provided.",
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        status: "error",
        message: "User belonging to this token no longer exists.",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      status: "error",
      message: "Token is invalid or expired.",
    });
  }
};
