const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const compression = require("compression");

const app = express();

// Security and utility middleware
app.use(compression());
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== "test") {
  app.use(morgan("dev"));
}

const authRoutes = require("./routes/auth.routes");
const taskRoutes = require("./routes/task.routes");
const aiRoutes = require("./routes/ai.routes");
const workoutRoutes = require("./routes/workout.routes");
const moodRoutes = require("./routes/mood.routes");
const reminderRoutes = require("./routes/reminder.routes");
const spotifyRoutes = require("./routes/spotify.routes");
const errorHandler = require("./middleware/error.middleware");

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/workouts", workoutRoutes);
app.use("/api/mood-checkin", moodRoutes);
app.use("/api/reminders", reminderRoutes);
app.use("/api/spotify", spotifyRoutes);

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK", message: "Server is running" });
});

// Root endpoint
app.get("/", (req, res) => {
  res.send("AI Life Manager API");
});

// Global error handler
app.use(errorHandler);

module.exports = app;
