const jwt = require("jsonwebtoken");

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "No token provided",
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const secret = process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET || "access_secret_fallback";
    const decoded = jwt.verify(token, secret);
    req.user = { id: decoded.id };
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
}

module.exports = authMiddleware;
