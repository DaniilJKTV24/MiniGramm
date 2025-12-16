import { AppView } from '../views/AppView';
import { Post } from '../models/Post';
import { PostDTO, ReactionType } from '../../shared/types';

/**
 * AppController coordinates interactions between the View and the Model.
 * It keeps the list of posts in memory, reacts to user actions passed
 * through the View, updates the data, and tells the View when to re-render.
 */
export class AppController {

  constructor(private view: AppView) {}

  /**
   * Initializes controller:
   * - connects View event handlers
   * - seeds demo posts
   * - renders initial UI
   */
  async init() {
    this.view.bindCreate(this.handleCreatePost);
    this.view.bindReact(this.handleReact);
    await this.loadPosts();
  }

  private async loadPosts() {
    const res = await fetch("/api/posts");
    const docs: PostDTO[] = await res.json();

    const posts = docs.map(doc => new Post(
      doc._id.toString(),
      doc.imageUrl,
      doc.caption,
      doc.reactions
    ));

    this.view.render(posts);
  }

  /**
   * Handles creating a new post when the user submits the form.
   * - Validates inputs
   * - Prepends the new post to the feed
   * - Renders the updated UI
   */
  private handleCreatePost = async (imageUrl: string, caption: string) => {
    if (!imageUrl || !caption) {
      this.view.showMessage('Image URL and caption are required!');
      return;
    }

    this.view.clearMessage();

    // Send POST request to backend
    const res = await fetch("/api/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imageUrl, caption })
    });

    if (!res.ok) {
      this.view.showMessage("Failed to create post.");
      return;
    }

    await this.loadPosts(); // Refresh UI from DB  
    this.view.resetForm();
  };

  /**
   * Handles reactions (like, wow, laugh).
   * - Finds the post
   * - Adds reaction counters via the model
   * - Re-renders the updated post list
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

    await this.loadPosts(); // Refresh UI from DB
  };
}
