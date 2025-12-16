import express from "express";
import cors from "cors";
import { connectDB } from "./database";
import { PostModel } from "./models/PostModel";
import { ReactionType, PostDTO } from "../shared/types";

const app = express();
const PORT = 3000;

// Middlewares
app.use(cors()); // Allow requests from Live Server / browser
app.use(express.json()); // Parse JSON bodies

async function start() {
  await connectDB();

  app.get("/health", (_req, res) => {
    res.send("ok");
  });

  // --- GET all posts ---
  app.get("/api/posts", async (_req, res) => {
    try {
      const docs = await PostModel.find().lean();
      const posts: PostDTO[] = docs.map(doc => ({
        _id: doc._id.toString(),
        imageUrl: doc.imageUrl,
        caption: doc.caption,
        reactions: doc.reactions
      }));
      res.json(posts);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  });

  // --- POST create new post ---
  app.post("/api/posts", async (req, res) => {
    try {
      const { imageUrl, caption } = req.body;
      if (!imageUrl || !caption) {
        return res.status(400).json({ message: "Missing imageUrl or caption" });
      }

      const doc = await PostModel.create({ imageUrl, caption });
      const post: PostDTO = {
        _id: doc._id.toString(),
        imageUrl: doc.imageUrl,
        caption: doc.caption,
        reactions: doc.reactions
      };
      res.status(201).json(post);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  });

  // --- POST add reaction ---
  app.post("/api/posts/:id/react", async (req, res) => {
    try {
      const { id } = req.params;
      const { reaction } = req.body as { reaction: ReactionType };

      if (!["like", "wow", "laugh"].includes(reaction)) {
        return res.status(400).json({ message: "Invalid reaction type" });
      }

      const doc = await PostModel.findById(id);
      if (!doc) return res.status(404).json({ message: "Post not found" });

      doc.reactions[reaction] = (doc.reactions[reaction] ?? 0) + 1;
      await doc.save();

      const post: PostDTO = {
        _id: doc._id.toString(),
        imageUrl: doc.imageUrl,
        caption: doc.caption,
        reactions: doc.reactions
      };

      res.json(post);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  });

  app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
  });
}

start();
