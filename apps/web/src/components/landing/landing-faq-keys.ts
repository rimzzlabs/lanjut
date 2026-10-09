/**
 * The landing FAQ, in order. The accordion and the page's FAQPage
 * structured data both read this list, so they always match.
 */
export const FAQ_KEYS = [
  "free",
  "account",
  "openSource",
  "storage",
  "files",
  "ats",
  "cv",
  "import",
  "language",
  "photo",
] as const;

export type FaqKey = (typeof FAQ_KEYS)[number];
