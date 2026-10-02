import { SITE } from "@/lib/site";

export function GET() {
  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
<url>
<loc>${SITE.url}</loc>
<xhtml:link rel="alternate" hreflang="en" href="${SITE.url}" />
<xhtml:link rel="alternate" hreflang="id" href="${SITE.url}/id" />
<changefreq>monthly</changefreq>
<priority>1</priority>
</url>
</urlset>
`,
    { headers: { "Content-Type": "application/xml" } },
  );
}
