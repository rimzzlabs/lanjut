import { SITE } from "@/lib/site";

export function GET() {
  return new Response(
    [
      "User-Agent: *",
      "Allow: /",
      "Disallow: /platform",
      "Disallow: /id/platform",
      "",
      `Sitemap: ${SITE.url}/sitemap.xml`,
      "",
    ].join("\n"),
    { headers: { "Content-Type": "text/plain; charset=utf-8" } },
  );
}
