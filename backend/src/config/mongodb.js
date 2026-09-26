import mongoose from "mongoose";
import logger from "../utils/Logger.js";

async function connectDB() {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    logger.success(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    logger.error(`MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
}

export { connectDB };
