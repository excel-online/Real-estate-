import mongoose from "mongoose";
import { env } from "./env";

export async function connectDB(): Promise<void> {
  mongoose.set("strictQuery", true); // silence deprecation warnings
  try {
    const conn = await mongoose.connect(env.MONGO_URI, {
      autoIndex: env.NODE_ENV === "development", // build indexes in prod separately
    });
    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
  } catch (err) {
    console.error("❌ MongoDB connection failed:", err);
    process.exit(1); // container orchestrators will restart
  }
}

mongoose.connection.on("disconnected", () => console.warn("⚠️  MongoDB disconnected"));
