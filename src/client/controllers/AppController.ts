import { AppView } from '../views/AppView.js';
import { Post } from '../models/Post.js';
import { PostDTO, ReactionType } from '../../shared/types.js';

/**
 * AppController acts as the client-side API controller.
 *
 * It translates user interactions from the View into HTTP requests
 * to the backend and converts API responses into client-side models
 * used for rendering.
 *
 * Unlike the pre-refactor browser-only version, this controller does
 * NOT persist data locally and does NOT act as the source of truth.
 */
export class AppController {

  constructor(private view: AppView) {}

  /**
   * Initializes the controller.
   *
   * - Binds view events to controller handlers
   * - Fetches initial application state from the backend API
   * - Triggers the first render
   */
  async init() {
    this.view.bindCreate(this.handleCreatePost);
    this.view.bindReact(this.handleReact);
    await this.loadPosts();
  }

  /**
   * Fetches all posts from the backend API and renders them.
   *
   * This method synchronizes the client UI with the current
   * server-side state stored in the database.
   */
  private async loadPosts() {
    const res = await fetch("/api/posts");
    const docs: PostDTO[] = await res.json();

    // Convert API DTOs into client-side Post models
    const posts = docs.map(doc => new Post(
      doc._id.toString(),
      doc.imageUrl,
      doc.caption,
      doc.reactions
    ));

    this.view.render(posts);
  }

  /**
   * Handles post creation initiated by the user.
   *
   * - Performs basic client-side validation
   * - Sends a create request to the backend
   * - Re-fetches posts to reflect the authoritative server state
   */
  private handleCreatePost = async (imageUrl: string, caption: string) => {
    if (!imageUrl || !caption) {
      this.view.showMessage('Image URL and caption are required!');
      return;
    }

    this.view.clearMessage();

    // Delegate post creation to the server
    const res = await fetch("/api/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imageUrl, caption })
    });

    if (!res.ok) {
      this.view.showMessage("Failed to create post.");
      return;
    }

    // Re-sync client state from the database
    await this.loadPosts(); 
    this.view.resetForm();
  };

  /**
   * Handles reaction actions (like, wow, laugh).
   *
   * The client does not mutate reaction counts locally.
   * Instead, it sends the intent to the server and then
   * reloads the updated state from the database.
   */
  private handleReact = async (postId: string, reaction: ReactionType) => {
    const res = await fetch(`/api/posts/${postId}/react`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reaction })
    });

    if (!res.ok) {
      console.error("Failed to add reaction");
      return;
    }

    // Refresh UI from authoritative server state
    await this.loadPosts(); // Refresh UI from DB
  };
}
