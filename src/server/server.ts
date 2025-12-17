import dotenv from "dotenv";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { connectDB } from "./database.js";
import { PostModel } from "./models/PostModel.js";
import { ReactionType, PostDTO } from "../shared/types.js";

// Load environment variables for server configuration
dotenv.config();

/**
 * Express application instance.
 * This server acts as the backend API and static file host
 * for the Minigramm client.
 */
const app = express();

// Load the port from environment variables
// Falls back to 3000 if not specified (useful for local dev)
const PORT = process.env.PORT || 3000;

// --- Global middlewares ---

// Parses incoming JSON request bodies for API routes
app.use(express.json());

// Resolve __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve the client (browser) build from the public directory
app.use(express.static(path.join(__dirname, "../../public")));

/**
 * Bootstraps the server.
 *
 * - Establishes the database connection
 * - Registers API routes
 * - Starts the HTTP server
 */
async function start() {
  // Connect to MongoDB before accepting requests
  await connectDB();

  /**
   * Health check endpoint.
   * Used by load balancers, containers, or monitoring tools
   * to verify that the server is running.
   */
  app.get("/health", (_req, res) => {
    res.send("ok");
  });

  /**
   * GET /api/posts
   *
   * Returns all posts stored in the database.
   * This endpoint is consumed by the client to render the feed.
   */
  app.get("/api/posts", async (_req, res) => {
    try {
      // Use lean() to return plain JS objects instead of Mongoose documents
      const docs = await PostModel.find().lean();

      // Map database documents to shared API DTOs
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

  /**
   * POST /api/posts
   *
   * Creates a new post.
   * The client sends post data; the server validates and persists it.
   */
  app.post("/api/posts", async (req, res) => {
    try {
      const { imageUrl, caption } = req.body;

      // Basic request validation
      if (!imageUrl || !caption) {
        return res.status(400).json({ message: "Missing imageUrl or caption" });
      }

      // Persist the post in MongoDB
      const doc = await PostModel.create({ imageUrl, caption });

      // Convert database document to API DTO
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

  /**
   * POST /api/posts/:id/react
   *
   * Adds a reaction to a post.
   * The server is responsible for validating reaction types
   * and updating counters atomically.
   */
  app.post("/api/posts/:id/react", async (req, res) => {
    try {
      const { id } = req.params;
      const { reaction } = req.body as { reaction: ReactionType };

      // Validate reaction type against allowed values
      if (!["like", "wow", "laugh"].includes(reaction)) {
        return res.status(400).json({ message: "Invalid reaction type" });
      }

      // Load the post from the database
      const doc = await PostModel.findById(id);
      if (!doc) return res.status(404).json({ message: "Post not found" });

      // Update reaction count
      doc.reactions[reaction] = (doc.reactions[reaction] ?? 0) + 1;
      await doc.save();

      // Return updated post to the client
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

  /**
   * Start listening for incoming HTTP requests.
   */
  app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
  });
}

// Start the server
start();
