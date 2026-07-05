"use client";

import { parseAsBoolean, useQueryState } from "nuqs";

/**
 * Open state of the create-résumé dialog, held in the `create` URL param so
 * entry points outside the dashboard (e.g. the landing CTA) can deep-link to
 * `/platform?create=true` and land with the dialog already open. Dropped from
 * the URL when closed.
 */
export function useResumeCreateDialog() {
  return useQueryState(
    "create",
    parseAsBoolean.withDefault(false).withOptions({ clearOnDefault: true }),
  );
}
