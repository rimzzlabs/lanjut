import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/platform", "/id/platform"],
    },
    sitemap: `${SITE.url}/sitemap.xml`,
  };
}
