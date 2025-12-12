import { AppView } from '../views/AppView.js';
import { Post, ReactionType } from '../models/Post.js';
import { PostModel } from '../models/PostModel.js';

/**
 * AppController coordinates interactions between the View and the Model.
 * It keeps the list of posts in memory, reacts to user actions passed
 * through the View, updates the data, and tells the View when to re-render.
 */
export class AppController {
  // // Internal list of posts (in-memory “database”)
  // private posts: Post[] = [];

  // // Auto-incrementing ID for new posts
  // private nextId = 1;

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
    // this.seed();
    // this.view.render(this.posts);
    await this.loadPosts();
  }

  // /**
  //  * Creates two initial demo posts.
  //  * This simulates pre-existing content in a social feed.
  //  */
  // private seed(): void {
  //   const demo: Post[] = [
  //     new Post(
  //       this.nextId++,
  //       'https://plus.unsplash.com/premium_photo-1700838996339-de3bd9663344?q=80&w=1972&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  //       'Decorated christmas tree',
  //       { like: 8, wow: 2, laugh: 1 }
  //     ),
  //     new Post(
  //       this.nextId++,
  //       'https://images.unsplash.com/photo-1619911112608-54e938faef00?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  //       'Neige à Paris',
  //       { like: 5, wow: 1, laugh: 0 }
  //     )
  //   ];

  //   this.posts = demo;
  // }

  private async loadPosts() {
    const docs = await PostModel.find().lean();

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

    const doc = await PostModel.create({ imageUrl, caption });

    const post = new Post(
      doc._id.toString(),
      doc.imageUrl,
      doc.caption,
      doc.reactions
    );

    await this.loadPosts(); // Refresh UI grom DB

    // // Add new post at the top of the feed
    // this.posts = [post, ...this.posts];

    // this.view.render(this.posts);
    this.view.resetForm();
  };

  /**
   * Handles reactions (like, wow, laugh).
   * - Finds the post
   * - Adds reaction counters via the model
   * - Re-renders the updated post list
   */
  private handleReact = async (postId: string, reaction: ReactionType) => {
    // const found = this.posts.find((post) => post.id === postId);
    // if (!found) return;
    const doc = await PostModel.findById(postId);
    if (!doc) return;

    // found.addReaction(reaction);
    // this.view.render(this.posts);

    //increment reaction in DB
    doc.reactions[reaction] = (doc.reactions[reaction] ?? 0) + 1;
    await doc.save();

    await this.loadPosts(); // Refresh UI from DB
  };
}
