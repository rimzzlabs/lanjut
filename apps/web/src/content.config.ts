import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

/**
 * The guides, one Markdown file per language: `guides/<locale>/<slug>.md`.
 * Both languages of a guide share the slug, so they share an address.
 */
const guides = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/guides" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    heading: z.string(),
    lead: z.string(),
    published: z.string(),
    updated: z.string(),
    order: z.number(),
  }),
});

export const collections = { guides };
