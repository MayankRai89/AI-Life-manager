import dns from "node:dns";
import mongoose from "mongoose";
import logger from "../utils/Logger.js";

async function connectDB() {
  const options = {
    maxPoolSize: parseInt(process.env.MONGO_MAX_POOL_SIZE || "100", 10),
    minPoolSize: parseInt(process.env.MONGO_MIN_POOL_SIZE || "10", 10),
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  };

  // Configure reliable public DNS servers for MongoDB Atlas SRV lookup on networks/ISPs that refuse SRV records
  if (process.env.MONGODB_URI?.startsWith("mongodb+srv://")) {
    try {
      dns.setServers(["8.8.8.8", "1.1.1.1"]);
    } catch (dnsErr) {
      logger.warn(`Could not set custom DNS servers: ${dnsErr.message}`);
    }
  }

  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, options);
    logger.success(`MongoDB Connected: ${conn.connection.host} (Pool: ${options.minPoolSize}-${options.maxPoolSize})`);

    mongoose.connection.on("error", (err) => {
      logger.error(`MongoDB runtime connection error: ${err.message}`);
    });

    mongoose.connection.on("disconnected", () => {
      logger.warn("MongoDB connection disconnected. Attempting reconnection...");
    });

    mongoose.connection.on("reconnected", () => {
      logger.info("MongoDB connection re-established.");
    });
  } catch (error) {
    logger.error(`MongoDB Initial Connection Error: ${error.message}`);
    process.exit(1);
  }
}

export { connectDB };
