// src/database.ts
import mongoose from "mongoose";
import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

// Default URI for local development if no env var is provided
const DEFAULT_URI = "mongodb://localhost:27017/minigramm";

/**
 * Returns the MongoDB URI.
 * Prefers the MONGODB_URI environment variable, falls back to DEFAULT_URI.
 */
function getMongoUri(): string {
  return process.env.MONGODB_URI || DEFAULT_URI;
}

/**
 * Establishes a connection to MongoDB using Mongoose.
 * Also sets up helpful event listeners and graceful shutdown.
 */
export async function connectDB(): Promise<void> {
  const uri = getMongoUri();

  if (process.env.NODE_ENV !== "production") {
    console.log(`[db] Connecting to MongoDB at ${uri}`);
  }

  await mongoose.connect(uri);
  // console.log(`[db] Connected: ${uri}`);

  // Connection event hooks
  mongoose.connection.on("connected", () => console.log("[db] Mongoose connected"));
  mongoose.connection.on("error", (err) => console.error("[db] Mongoose error:", err));
  mongoose.connection.on("disconnected", () => console.log("[db] Mongoose disconnected"));

  // Graceful shutdown on Ctrl+C
  process.on("SIGINT", async () => {
    await mongoose.connection.close();
    console.log("[db] Mongoose connection closed (SIGINT)");
    process.exit(0);
  });
}

/**
 * Closes the MongoDB connection manually.
 */
export async function disconnectDB(): Promise<void> {
  await mongoose.connection.close();
  console.log("[db] Disconnected");
}
