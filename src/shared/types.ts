export type ReactionType = "like" | "wow" | "laugh";

export interface PostDTO {
  _id: string;
  imageUrl: string;
  caption: string;
  reactions: Record<ReactionType, number>;
}