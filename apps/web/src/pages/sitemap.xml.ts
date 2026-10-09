import { localizePath, routing } from "@lanjut/i18n/routing";
import { A, pipe } from "@mobily/ts-belt";
import {
  absoluteUrl,
  alternatesOf,
  defaultAlternateOf,
  INDEXED_PATHS,
} from "@/lib/seo";

// The build date: every release rebuilds the pages it lists.
const LAST_MODIFIED = new Date().toISOString().slice(0, 10);

/** One `<url>` per page and language, each naming all its languages. */
function entry(path: string, locale: (typeof routing.locales)[number]) {
  const links = pipe(
    alternatesOf(path),
    A.map(
      (alternate) =>
        `<xhtml:link rel="alternate" hreflang="${alternate.hreflang}" href="${alternate.href}" />`,
    ),
    A.append(
      `<xhtml:link rel="alternate" hreflang="x-default" href="${defaultAlternateOf(path)}" />`,
    ),
    A.join("\n"),
  );
  return `<url>
<loc>${absoluteUrl(localizePath(path, locale))}</loc>
${links}
<lastmod>${LAST_MODIFIED}</lastmod>
</url>`;
}

export function GET() {
  const urls = pipe(
    INDEXED_PATHS,
    A.flatMap((path) =>
      A.map(routing.locales, (locale) => entry(path, locale)),
    ),
    A.join("\n"),
  );
  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls}
</urlset>
`,
    { headers: { "Content-Type": "application/xml" } },
  );
}
