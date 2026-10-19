import type { MESSAGES } from "./messages";

/**
 * The namespaces that the landing page's islands read. An island that reads a
 * new namespace adds it here.
 */
export const ISLAND_NAMESPACES = [
  "contributors",
  "landing",
  "language",
  "nav",
  "ui",
] as const;

export type IslandMessages = Pick<
  (typeof MESSAGES)["en"],
  (typeof ISLAND_NAMESPACES)[number]
>;
