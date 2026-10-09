/**
 * The minimal number of single-character edits (insert, delete, substitute) to
 * align `query` against the best-matching substring of `text`, a Levenshtein
 * distance DP whose first row is left at zero, so a match may begin at any
 * offset in `text`. A return of 0 means `query` occurs verbatim in `text`.
 *
 * Both inputs are expected pre-normalized (e.g. lowercased) by the caller.
 */
export function levenshteinSubstring(query: string, text: string): number {
  if (query.length === 0) return 0;
  if (text.length === 0) return query.length;

  // Two rolling rows over the query (rows) × text (cols) grid.
  let previous = new Array<number>(text.length + 1).fill(0);
  let current = new Array<number>(text.length + 1).fill(0);

  for (let i = 1; i <= query.length; i++) {
    current[0] = i;
    for (let j = 1; j <= text.length; j++) {
      const cost = query[i - 1] === text[j - 1] ? 0 : 1;
      current[j] = Math.min(
        previous[j] + 1, // deletion from query
        current[j - 1] + 1, // insertion into query
        previous[j - 1] + cost, // match / substitution
      );
    }
    [previous, current] = [current, previous];
  }

  return Math.min(...previous);
}
