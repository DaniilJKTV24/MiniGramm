/**
 * Defines available reaction types for a post.
 */
export type ReactionType = "like" | "wow" | "laugh";

/**
 * Represents a social media post with an image, caption,
 * and reaction counters. Includes logic to safely increment reactions.
 */
export class Post {
  constructor(
    public id: string, // accept MongoDB ObjectId (string)
    public imageUrl: string,
    public caption: string,
    public reactions: Record<ReactionType, number> = {
      like: 0,
      wow: 0,
      laugh: 0
    }
  ) {}

  /**
   * Increments the counter of the specified reaction type.
   * @param type - The reaction type to increment.
   */
  addReaction(type: ReactionType): void {
    this.reactions[type] = (this.reactions[type] ?? 0) + 1;
  }
}
