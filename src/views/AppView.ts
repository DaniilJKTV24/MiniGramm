import { Post, ReactionType } from '../models/Post.js';

type CreateHandler = (imageUrl: string, caption: string) => void;
type ReactHandler = (postId: number, reaction: ReactionType) => void;

/**
 * AppView handles all DOM manipulation and user interaction.
 * It displays posts, manages form input, renders reaction buttons,
 * and sends user actions upward via bound handlers.
 */
export class AppView {
  private form: HTMLFormElement;
  private list: HTMLElement;
  private message: HTMLElement;

  // Handlers provided by the controller
  private createHandler?: CreateHandler;
  private reactHandler?: ReactHandler;

  constructor(private root: HTMLElement) {
    // Build basic UI layout
    this.root.innerHTML = `
      <section class="composer">
        <h1>MiniGramm</h1>
        <form class="post-form">
          <label>Image URL
            <input name="imageUrl" type="url" placeholde"https://..." required />
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

    // Cache DOM references
    this.form = this.root.querySelector('.post-form') as HTMLFormElement;
    this.list = this.root.querySelector('.feed') as HTMLElement;
    this.message = this.root.querySelector('.message') as HTMLElement;

    // Form submission triggers create handler
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
   * Binds the create-post handler supplied by the controller.
   */
  bindCreate(handler: CreateHandler): void {
    this.createHandler = handler;
  }

  /**
   * Binds the reaction handler supplied by the controller.
   */
  bindReact(handler: ReactHandler): void {
    this.reactHandler = handler;
  }

  /**
   * Displays a visible message (typically validation or error).
   */
  showMessage(text: string): void {
    this.message.textContent = text;
    this.message.classList.add('visible');
  }

  /**
   * Clears the currently displayed message.
   */
  clearMessage(): void {
    this.message.textContent = '';
    this.message.classList.remove('visible');
  }

  /**
   * Resets the form and focuses the first input field.
   */
  resetForm(): void {
    this.form.reset();
    const firstInput = this.form.querySelector('input');
    firstInput?.focus();
  }

  /**
   * Renders the full list of posts.
   * If list is empty, displays an empty-state message.
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
   * Creates a DOM element for a single post card.
   * Includes image, caption, and reaction buttons.
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

    // Attach click handlers to each reaction button
    const buttons = container.querySelectorAll('[data-reaction]');
    buttons.forEach((button) => {
      button.addEventListener('click', () => {
        const reaction = (button as HTMLElement).dataset.reaction as ReactionType;
        const postId = Number((button as HTMLElement).dataset.postId);
        this.reactHandler?.(postId, reaction);
      });
    });

    return container;
  }

  /**
   * Helper to generate HTML for a reaction button.
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
