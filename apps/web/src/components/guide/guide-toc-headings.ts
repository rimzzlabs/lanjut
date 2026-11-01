import { A, pipe } from "@mobily/ts-belt";
import type { MarkdownHeading } from "astro";

export interface TocHeading {
  depth: number;
  slug: string;
  text: string;
}

/** The second- and third-level headings of a guide, for its table of contents. */
export function toTocHeadings(
  headings: ReadonlyArray<MarkdownHeading>,
): ReadonlyArray<TocHeading> {
  return pipe(
    headings,
    A.filter((heading) => heading.depth === 2 || heading.depth === 3),
    A.map((heading) => ({
      depth: heading.depth,
      slug: heading.slug,
      text: heading.text,
    })),
  );
}
