import { RESUME_SORTS } from "@lanjut/resume";
import { parseAsStringLiteral, useQueryState } from "nuqs";

/** The library sort order, held in the `sort` URL param (default last edited). */
export function useResumeSort() {
  return useQueryState(
    "sort",
    parseAsStringLiteral(RESUME_SORTS)
      .withDefault("edited")
      .withOptions({ clearOnDefault: true }),
  );
}
