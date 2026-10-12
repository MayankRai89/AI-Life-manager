import { AppError } from "./errorHandler.middleware.js";

/**
 * Middleware ensuring the authenticated user has the 'admin' role.
 * Must run AFTER protect middleware so req.user is populated from the DB record.
 */
export const adminOnly = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    throw new AppError("Forbidden", 403);
  }
  next();
};

export default adminOnly;
