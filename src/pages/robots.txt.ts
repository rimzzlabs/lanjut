import { A } from "@mobily/ts-belt";
import { SITE } from "@/lib/site";

export function GET() {
  return new Response(
    A.join(
      [
        "User-Agent: *",
        "Allow: /",
        "Disallow: /platform",
        "Disallow: /id/platform",
        "",
        `Sitemap: ${SITE.url}/sitemap.xml`,
        "",
      ],
      "\n",
    ),
    { headers: { "Content-Type": "text/plain; charset=utf-8" } },
  );
}
