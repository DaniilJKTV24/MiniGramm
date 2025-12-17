/**
 * Defines all valid reaction identifiers supported by the system.
 *
 * This union type is shared between the client and server to ensure
 * consistent validation, API contracts, and compile-time safety.
 */
export type ReactionType = "like" | "wow" | "laugh";

/**
 * PostDTO represents the data transfer object sent over the network.
 *
 * It defines the exact shape of a Post as exposed by the server API
 * and consumed by the client application.
 *
 * Notes:
 * - This is NOT a database model.
 * - It intentionally omits server-only concerns (e.g. Mongoose metadata).
 * - It acts as a stable contract between client and server.
 */
export interface PostDTO {
  _id: string;
  imageUrl: string;
  caption: string;
  reactions: Record<ReactionType, number>;
}
