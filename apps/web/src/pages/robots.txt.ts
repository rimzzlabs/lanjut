import { A } from "@mobily/ts-belt";
import { SITE } from "@/lib/site";

export function GET() {
  return new Response(
    A.join(
      [
        "User-Agent: *",
        "Allow: /",
        "Disallow: /editor",
        "Disallow: /template",
        "Disallow: /id/editor",
        "Disallow: /id/template",
        "",
        `Sitemap: ${SITE.url}/sitemap.xml`,
        "",
      ],
      "\n",
    ),
    { headers: { "Content-Type": "text/plain; charset=utf-8" } },
  );
}
