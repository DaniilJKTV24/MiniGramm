import express from "express";
import { connectDB } from "./database.js";

const app = express();
const PORT = 3000;

async function start() {
  await connectDB();

  app.get("/health", (_req, res) => {
    res.send("ok");
  });

  app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
  });
}

start();
