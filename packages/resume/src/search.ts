import { A, O, pipe, S } from "@mobily/ts-belt";
import { levenshteinSubstring } from "./levenshtein";
import type { ResumeIndexEntry } from "./types";

/** Share of the query length allowed as edit errors before a title is rejected. */
const ERROR_TOLERANCE = 0.4;

/**
 * The closest saved résumé to a requested id that no longer resolves, the
 * "did you mean" candidate for mangled or truncated editor links. Distance is
 * measured on ids (the only signal a broken URL carries); anything beyond
 * tolerance returns undefined, so a genuinely deleted résumé suggests nothing.
 */
export function nearestResumeById(
  index: readonly ResumeIndexEntry[],
  missingId: string,
): ResumeIndexEntry | undefined {
  const query = pipe(missingId, S.trim, S.toLowerCase);
  if (S.isEmpty(query)) return undefined;

  const threshold = Math.floor(S.length(query) * ERROR_TOLERANCE);

  return pipe(
    index,
    A.map((entry) => ({
      entry,
      distance: levenshteinSubstring(query, S.toLowerCase(entry.id)),
    })),
    A.filter((scored) => scored.distance <= threshold),
    A.sortBy((scored) => scored.distance),
    A.head,
    O.map((scored) => scored.entry),
    O.toUndefined,
  );
}

/**
 * Filter the Library index by a fuzzy title match, ranked best-first. An empty
 * query passes the list through untouched. Otherwise each title is scored by its
 * Levenshtein substring distance to the query; titles within tolerance are kept
 * and ordered by ascending distance (exact substring hits first), preserving the
 * incoming newest-first order for ties.
 */
export function filterResumeIndex(
  index: readonly ResumeIndexEntry[],
  rawQuery: string,
): readonly ResumeIndexEntry[] {
  const query = pipe(rawQuery, S.trim, S.toLowerCase);
  if (S.isEmpty(query)) return index;

  const threshold = Math.floor(S.length(query) * ERROR_TOLERANCE);

  return pipe(
    index,
    A.map((entry) => ({
      entry,
      distance: levenshteinSubstring(query, S.toLowerCase(entry.title)),
    })),
    A.filter((scored) => scored.distance <= threshold),
    A.sortBy((scored) => scored.distance),
    A.map((scored) => scored.entry),
  );
}
