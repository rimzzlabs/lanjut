/** One build file that the service worker keeps for offline use. */
export interface PrecacheEntry {
  url: string;
  /** A hash of the file's content. A file with a new revision downloads again. */
  revision: string;
  /** Saved the first time the app fetches it, not at install. */
  lazy?: true;
}
