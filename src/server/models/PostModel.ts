import mongoose, { Schema } from "mongoose";
import { ReactionType } from "../../shared/types.js";

/**
 * IPost defines the structure of a Post as it exists
 * on the server and is stored in the database.
 *
 * This interface represents the authoritative data model
 * used by the backend, not a client-side view model.
 */
export interface IPost {
  imageUrl: string;
  caption: string;
  reactions: Record<ReactionType, number>;
}

/**
 * PostSchema describes how Post documents are stored
 * and validated in MongoDB.
 *
 * It is used exclusively on the server by Mongoose to
 * enforce schema rules, apply defaults, and enable
 * database queries and updates.
 */
const PostSchema = new Schema<IPost>({
  imageUrl: { type: String, required: true },
  caption: { type: String, required: true },
  reactions: {
    like: { type: Number, default: 0 },
    wow: { type: Number, default: 0 },
    laugh: { type: Number, default: 0 }
  }
});

/**
 * PostModel is the server-side Mongoose model connected
 * to the "posts" collection in MongoDB.
 *
 * Controllers and services use this model to perform
 * persistent CRUD operations in response to client requests.
 */
export const PostModel = mongoose.model<IPost>("Post", PostSchema);
