import { parseAsBoolean, useQueryState } from "nuqs";

/**
 * Open state of the create-résumé sheet, held in the `create` URL param so
 * entry points outside the dashboard (e.g. the landing CTA) can deep-link to
 * `/editor?create=true` and land with the sheet already open. Dropped from
 * the URL when closed.
 */
export function useResumeCreateSheet() {
  return useQueryState(
    "create",
    parseAsBoolean.withDefault(false).withOptions({ clearOnDefault: true }),
  );
}
