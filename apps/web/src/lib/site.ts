/**
 * Canonical site identity, shared by metadata, Open Graph, robots, and the
 * sitemap. Titles and descriptions live in the `meta` messages, per language.
 */
export const SITE = {
  name: "Lanjut",
  url: "https://lanjut.org",
} as const;

/** The source repository, linked from the landing page and its footer. */
export const REPO_URL = "https://github.com/rimzzlabs/lanjut";

/** How to contribute, linked wherever Lanjut thanks its contributors. */
export const CONTRIBUTING_URL = `${REPO_URL}/blob/main/CONTRIBUTING.md`;

/** Donation profiles, shared by the landing footer and the platform sidebar. */
export const DONATION_LINKS = {
  saweria: "https://saweria.co/rimzzlabs",
  sociabuzz: "https://sociabuzz.com/rimzzlabs/tribe",
} as const;

/**
 * Where the desktop download points. The latest-release page rather than a
 * pinned asset, so the link does not rot when a new version publishes.
 */
export const DESKTOP_RELEASE_URL =
  "https://github.com/rimzzlabs/lanjut/releases/latest";
