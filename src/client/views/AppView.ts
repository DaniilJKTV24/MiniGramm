import { Post } from '../models/Post.js';
import { ReactionType } from '../../shared/types.js';

type CreateHandler = (imageUrl: string, caption: string) => void;
type ReactHandler = (postId: string, reaction: ReactionType) => void;

/**
 * AppView is responsible for all client-side UI concerns.
 *
 * It renders server-provided post data into the DOM, captures user input
 * (creating posts and reacting to posts), and forwards those interactions
 * upward to the controller layer.
 *
 * AppView does NOT manage application state or perform network requests.
 * Instead, it delegates all business logic and server communication
 * to handlers supplied by the controller.
 */
export class AppView {
  private form: HTMLFormElement;
  private list: HTMLElement;
  private message: HTMLElement;

  // Callback handlers injected by the controller.
  // These typically trigger API requests to the server.
  private createHandler?: CreateHandler;
  private reactHandler?: ReactHandler;

  constructor(private root: HTMLElement) {
    // Construct the static client-side UI layout.
    // Dynamic content (posts, counts, messages) is injected later.
    this.root.innerHTML = `
      <section class="composer">
        <h1>MiniGramm</h1>
        <form class="post-form">
          <label>Image URL
            <input name="imageUrl" type="url" placeholder="https://..." required />
          </label>
          <label>Caption
            <input name="caption" type="text" placeholder="Type something" maxlength="120" required />
          </label>
          <button type="submit">Post</button>
        </form>
        <p class="message" aria-live="polite"></p>
      </section>
      <section class="feed"></section>
    `;

    // Cache DOM references for later updates
    this.form = this.root.querySelector('.post-form') as HTMLFormElement;
    this.list = this.root.querySelector('.feed') as HTMLElement;
    this.message = this.root.querySelector('.message') as HTMLElement;

    // Intercept form submission and forward sanitized user input
    // to the controller, which will handle validation and
    // server-side persistence.
    this.form.addEventListener('submit', (event) => {
      event.preventDefault();
      if (!this.createHandler) return;

      const formData = new FormData(this.form);
      const imageUrl = String(formData.get('imageUrl') || '').trim();
      const caption = String(formData.get('caption') || '').trim();

      this.createHandler(imageUrl, caption);
    });
  }

  /**
   * Registers a handler for creating a new post.
   * The controller typically uses this to send a POST request
   * to the server and then refresh the feed.
   */
  bindCreate(handler: CreateHandler): void {
    this.createHandler = handler;
  }

  /**
   * Registers a handler for reacting to a post.
   * The controller typically forwards this interaction
   * to the server and updates the UI with the latest data.
   */
  bindReact(handler: ReactHandler): void {
    this.reactHandler = handler;
  }

  /**
   * Displays a user-facing status or error message.
   * Commonly used to surface validation or server errors.
   */
  showMessage(text: string): void {
    this.message.textContent = text;
    this.message.classList.add('visible');
  }

  /**
   * Clears any currently displayed status or error message.
   */
  clearMessage(): void {
    this.message.textContent = '';
    this.message.classList.remove('visible');
  }

  /**
   * Resets the post creation form after a successful
   * server-side create operation.
   */
  resetForm(): void {
    this.form.reset();
    const firstInput = this.form.querySelector('input');
    firstInput?.focus();
  }

  /**
   * Renders the complete post feed using data supplied
   * by the controller (typically fetched from the server).
   *
   * This method performs a full re-render and does not
   * retain local state.
   */
  render(posts: Post[]): void {
    this.list.innerHTML = '';

    if (!posts.length) {
      const empty = document.createElement('p');
      empty.className = 'empty';
      empty.textContent = 'No posts yet. Add one!';
      this.list.appendChild(empty);
      return;
    }

    posts.forEach((post) =>
      this.list.appendChild(this.createPostElement(post))
    );
  }

  /**
   * Creates a DOM representation of a single post.
   *
   * Reaction buttons emit events upward but do not mutate
   * local state directly; all updates are driven by
   * server-confirmed data.
   */
  private createPostElement(post: Post): HTMLElement {
    const container = document.createElement('article');
    container.className = 'post-card';
    container.innerHTML = `
      <div class="image-wrap">
        <img src="${post.imageUrl}" alt="${post.caption}" loading="lazy" />
      </div>
      <div class="post-body">
        <p class="caption">${post.caption}</p>
        <div class="reactions">
          ${this.reactionButton(post, 'like', 'like', post.reactions.like)}
          ${this.reactionButton(post, 'wow', 'wow', post.reactions.wow)}
          ${this.reactionButton(post, 'laugh', 'laugh', post.reactions.laugh)}
        </div>
      </div>
    `;

    // Bind reaction buttons to the controller handler.
    // The controller is responsible for syncing the reaction
    // with the server and triggering a re-render.
    const buttons = container.querySelectorAll('[data-reaction]');
    buttons.forEach((button) => {
      button.addEventListener('click', () => {
        const reaction = (button as HTMLElement).dataset.reaction as ReactionType;
        const postId = (button as HTMLElement).dataset.postId as string;
        this.reactHandler?.(postId, reaction);
      });
    });

    return container;
  }

  /**
   * Generates the markup for a reaction button.
   * The displayed count reflects server-sourced state.
   */
  private reactionButton(
    post: Post,
    reaction: ReactionType,
    label: string,
    count: number
  ): string {
    return `
      <button class="reaction" data-post-id="${post.id}" data-reaction="${reaction}">
        <span>${label}</span>
        <strong>${count}</strong>
      </button>
    `;
  }
}
