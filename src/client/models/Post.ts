import { ReactionType } from '../../shared/types.js';

/**
 * Client-side Post view model.
 *
 * This class represents a Post as it is used by the UI layer.
 * It mirrors the data received from the backend API but does
 * NOT contain any persistence or networking logic.
 *
 * The server and database remain the single source of truth.
 */
export class Post {
  constructor(
    // MongoDB ObjectId received from the server, serialized as a string
    public id: string,
    public imageUrl: string,
    public caption: string,

    // Reaction counters as provided by the backend
    public reactions: Record<ReactionType, number> = {
      like: 0,
      wow: 0,
      laugh: 0
    }
  ) {}

  /**
   * Updates reaction counts locally.
   *
   * This method is intended for UI-related state updates
   * (e.g. optimistic rendering) and does NOT persist changes.
   * Any authoritative updates must come from the backend API.
   */
  addReaction(type: ReactionType): void {
    this.reactions[type] = (this.reactions[type] ?? 0) + 1;
  }
}
