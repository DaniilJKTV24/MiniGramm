import mongoose from "mongoose";
import dotenv from "dotenv";

// Load environment variables for server configuration
dotenv.config();

// Fallback URI for local development when no environment variable is set
const DEFAULT_URI = "mongodb://localhost:27017/minigramm";

/**
 * Resolves the MongoDB connection string for the server.
 *
 * The server prefers the MONGODB_URI environment variable
 * (used in staging/production) and falls back to a local
 * development URI if none is provided.
 */
function getMongoUri(): string {
  return process.env.MONGODB_URI || DEFAULT_URI;
}

/**
 * Initializes the server's connection to MongoDB using Mongoose.
 *
 * This function is typically called once during server startup.
 * It establishes the database connection, registers connection
 * lifecycle event listeners, and ensures graceful shutdown
 * when the server process is terminated.
 */
export async function connectDB(): Promise<void> {
  const uri = getMongoUri();

  if (process.env.NODE_ENV !== "production") {
    console.log(`[db] Connecting to MongoDB at ${uri}`);
  }

  await mongoose.connect(uri);

  // Mongoose connection lifecycle events (server-side only)
  mongoose.connection.on("connected", () => console.log("[db] Mongoose connected"));
  mongoose.connection.on("error", (err) => console.error("[db] Mongoose error:", err));
  mongoose.connection.on("disconnected", () => console.log("[db] Mongoose disconnected"));

  // Graceful shutdown on process termination (e.g. Ctrl+C, Docker stop)
  process.on("SIGINT", async () => {
    await mongoose.connection.close();
    console.log("[db] Mongoose connection closed (SIGINT)");
    process.exit(0);
  });
}

/**
 * Explicitly closes the MongoDB connection.
 *
 * Useful for controlled shutdowns, background jobs,
 * or automated testing environments.
 */
export async function disconnectDB(): Promise<void> {
  await mongoose.connection.close();
  console.log("[db] Disconnected");
}
