import "dotenv/config";
import app from "./src/app.js";
import { connectDB } from "./src/config/mongodb.js";
import logger from "./src/utils/Logger.js";

const PORT = process.env.PORT || 3000;

// Connect to MongoDB & Start Server
connectDB();

const server = app.listen(PORT, () => {
  logger.info(`Server running on PORT: ${PORT}`);
});

// Handle graceful shutdown
process.on("SIGINT", () => {
  logger.warn("Shutting down server gracefully...");
  server.close(() => {
    logger.info("Server closed.");
    process.exit(0);
  });
});

process.on("unhandledRejection", (err) => {
  logger.error(`Unhandled Rejection: ${err.message}`, err);
  server.close(() => process.exit(1));
});
