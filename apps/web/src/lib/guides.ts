/** The guides, in the order the hub lists them. Each has a file per language. */
export const GUIDE_SLUGS = [
  "ats-resume-examples",
  "how-to-make-an-ats-resume",
] as const;

export type GuideSlug = (typeof GUIDE_SLUGS)[number];

export const GUIDE_PATHNAME = "/guide";

export function guidePath(slug: GuideSlug): string {
  return `${GUIDE_PATHNAME}/${slug}`;
}
