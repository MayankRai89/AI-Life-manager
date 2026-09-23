import mongoose from "mongoose";
async function connectDB() {
  try {
    await mongoose
      .connect(process.env.MONGODB_URI)
      .then(() => {
        console.log("Connect to DB");
      })
      .catch((error) => {
        console.log("Not Connected to DB");
        console.error(error.message);
        process.exit(1);
      });
  } catch (error) {
    console.log("Not Connected to DB");
  }
}

export { connectDB };
