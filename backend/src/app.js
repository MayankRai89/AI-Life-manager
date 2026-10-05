import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import compression from "compression";
import rateLimit from "express-rate-limit";
import authRoutes from "./routes/auth.routes.js";
import taskRoutes from "./routes/task.routes.js";
import moodRoutes from "./routes/mood.routes.js";
import aiRoutes from "./routes/ai.routes.js";
import { errorHandler } from "./middleware/errorHandler.middleware.js";
import logger from "./utils/Logger.js";

const app = express();

// Trust reverse proxy (needed for accurate IP rate limiting behind ALB, Nginx, Render)
app.set("trust proxy", 1);

// Security Headers & Payload Compression
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);
app.use(compression());

// Middlewares
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true, limit: "2mb" }));
app.use(cookieParser());
app.use(logger.httpMiddleware);

// ============================================================
// Rate Limiting (Traffic Protection for Large Scale)
// ============================================================
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // Max 500 requests per IP per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: "fail",
    message: "Too many requests from this IP. Please try again later.",
  },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Max 20 login/register attempts per IP per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: "fail",
    message: "Too many authentication attempts. Please try again after 15 minutes.",
  },
});

const aiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // Max 30 AI requests per minute per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: "fail",
    message: "AI processing capacity reached. Please wait a moment before sending more requests.",
  },
});

// Base & Health Routes (No rate limiting on health probes)
app.get("/", (req, res) => {
  res.json({
    status: "success",
    message: "AI Life Manager API is running",
    timestamp: new Date().toISOString(),
  });
});

app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "healthy",
    uptime: process.uptime(),
  });
});

// Apply General Rate Limiter to API routes
app.use("/api", generalLimiter);

// Feature Routes with specific rate limiters
app.use("/api/auth/login", authLimiter);
app.use("/api/auth/register", authLimiter);
app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/moods", moodRoutes);
app.use("/api/ai", aiLimiter, aiRoutes);

// 404 Route Handler
app.use((req, res, next) => {
  res.status(404).json({
    status: "fail",
    message: `Route ${req.originalUrl} not found`,
  });
});

// Centralized Global Error Handler
app.use(errorHandler);

export default app;
