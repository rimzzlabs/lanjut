import { A } from "@mobily/ts-belt";
import { SITE } from "@/lib/site";

// Every page stays crawlable, `/profile` included: it carries `noindex`, and
// a crawler must be let in to read it. A disallowed page that others link to
// can still be indexed, from its links alone. AI search crawlers fall under
// `*` as well.
export function GET() {
  return new Response(
    A.join(
      [
        "User-Agent: *",
        "Allow: /",
        "Disallow: /api/",
        "",
        `Sitemap: ${SITE.url}/sitemap-index.xml`,
        "",
      ],
      "\n",
    ),
    { headers: { "Content-Type": "text/plain; charset=utf-8" } },
  );
}
