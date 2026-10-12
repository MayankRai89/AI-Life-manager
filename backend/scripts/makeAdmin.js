import "dotenv/config";
import dns from "node:dns";
import mongoose from "mongoose";
import User from "../src/model/user.model.js";

async function makeAdmin() {
  const email = process.argv[2];

  if (!email || !email.trim()) {
    console.error("Error: Please provide a user email as an argument.");
    console.error("Usage: npm run make-admin -- <email> or node scripts/makeAdmin.js <email>");
    process.exit(1);
  }

  const normalizedEmail = email.trim().toLowerCase();

  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    console.error("Error: MONGODB_URI environment variable is not defined.");
    process.exit(1);
  }

  // Handle Atlas SRV DNS configuration if needed
  if (mongoUri.startsWith("mongodb+srv://")) {
    try {
      dns.setServers(["8.8.8.8", "1.1.1.1"]);
    } catch {
      // Ignore if DNS server override fails
    }
  }

  try {
    await mongoose.connect(mongoUri);

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      console.error(`Error: User with email "${normalizedEmail}" not found.`);
      await mongoose.disconnect();
      process.exit(1);
    }

    user.role = "admin";
    await user.save({ validateBeforeSave: false });

    console.log(`Success: User "${user.email}" (ID: ${user._id}) has been updated to role "admin".`);
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("Error updating user role to admin:", error.message);
    try {
      await mongoose.disconnect();
    } catch {
      // Ignore disconnect errors
    }
    process.exit(1);
  }
}

makeAdmin();
