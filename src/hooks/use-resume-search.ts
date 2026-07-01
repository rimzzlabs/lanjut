"use client";

import { parseAsString, useQueryState } from "nuqs";

/**
 * The Library search query, held in the `q` URL param so it survives reload and
 * is shareable. Shared by the search input (writer) and the grid (reader).
 * Updates are throttled to keep typing from flooding history, and the param is
 * dropped from the URL when empty.
 */
export function useResumeSearchQuery() {
  return useQueryState(
    "q",
    parseAsString
      .withDefault("")
      .withOptions({ clearOnDefault: true, throttleMs: 200 }),
  );
}
