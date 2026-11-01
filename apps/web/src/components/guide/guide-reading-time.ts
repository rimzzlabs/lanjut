import { A, G, pipe, S } from "@mobily/ts-belt";

const WORDS_PER_MINUTE = 200;

/** Minutes to read a Markdown body, at least one. */
export function readingMinutes(markdown: string): number {
  const words = pipe(
    markdown,
    S.splitByRe(/\s+/),
    A.filter(G.isString),
    A.reject(S.isEmpty),
    A.length,
  );
  return Math.max(1, Math.round(words / WORDS_PER_MINUTE));
}
