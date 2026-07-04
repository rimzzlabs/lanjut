"use client";

import { parseAsString, parseAsStringLiteral, useQueryState } from "nuqs";
import { TEMPLATE_SORTS } from "@/lib/templates";

/**
 * Browse-Templates search query, held in the `q` URL param so it survives reload
 * and is shareable. Throttled and dropped from the URL when empty.
 */
export function useTemplateSearchQuery() {
  return useQueryState(
    "q",
    parseAsString
      .withDefault("")
      .withOptions({ clearOnDefault: true, throttleMs: 200 }),
  );
}

/** Browse-Templates sort order, held in the `sort` URL param (default name A–Z). */
export function useTemplateSort() {
  return useQueryState(
    "sort",
    parseAsStringLiteral(TEMPLATE_SORTS)
      .withDefault("name-asc")
      .withOptions({ clearOnDefault: true }),
  );
}
