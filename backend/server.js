import "dotenv/config";
import app from "./src/app.js";
import { connectDB } from "./src/db/mongodb.js";

const PORT = process.env.PORT || 3000;

// Connect to MongoDB & Start Server
connectDB();

const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on PORT : ${PORT}`);
});

// Handle graceful shutdown
process.on("SIGINT", () => {
  console.log("\nShutting down gracefully...");
  server.close(() => {
    console.log("Server closed.");
    process.exit(0);
  });
});

process.on("unhandledRejection", (err) => {
  console.error("Unhandled Rejection:", err);
  server.close(() => process.exit(1));
});
