import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: SITE.url,
      changeFrequency: "monthly",
      priority: 1,
      alternates: {
        languages: {
          en: SITE.url,
          id: `${SITE.url}/id`,
        },
      },
    },
  ];
}
