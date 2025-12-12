import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();
const DEFAULT_URI = "mongodb://localhost:27017/minigramm";

function getMongoUri(): string {
  // Prefer env var, fallback to local dev URI
  return process.env.MONGODB_URI || DEFAULT_URI;
}

export async function connectDB(): Promise<void> {
  const uri = getMongoUri();

  // Recommended options for modern Mongoose
  await mongoose.connect(uri, {
    // You can add options here if needed
  });

  console.log(`[db] Connected: ${uri}`);

  // Connection event hooks (optional but useful)
  mongoose.connection.on("connected", () => console.log("[db] Mongoose connected"));
  mongoose.connection.on("error", (err) => console.error("[db] Mongoose error:", err));
  mongoose.connection.on("disconnected", () => console.log("[db] Mongoose disconnected"));

  // Graceful shutdown on process termination
  process.on("SIGINT", async () => {
    await mongoose.connection.close();
    console.log("[db] Mongoose connection closed (SIGINT)");
    process.exit(0);
  });
}

export async function disconnectDB(): Promise<void> {
  await mongoose.connection.close();
  console.log("[db] Disconnected");
}
