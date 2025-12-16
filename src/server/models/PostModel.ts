import mongoose, { Schema } from "mongoose";
import { ReactionType } from "../../shared/types.js";

/**
 * IPost interface describes the shape of a Post document
 * as it will be stored in MongoDB.
 */
export interface IPost {
  imageUrl: string;
  caption: string;
  reactions: Record<ReactionType, number>;
}

/**
 * PostSchema defines the MongoDB schema for posts.
 * It matches the Post class fields but is used by Mongoose
 * to persist and query documents in the database.
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
 * PostModel is the Mongoose model bound to the "posts" collection.
 * Use this for database operations (find, save, update).
 */
export const PostModel = mongoose.model<IPost>("Post", PostSchema);
