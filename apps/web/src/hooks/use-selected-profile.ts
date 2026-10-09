import { parseAsString, useQueryState } from "nuqs";

/** The selection that shows the form for a profile not saved yet. */
export const NEW_PROFILE = "new";

/**
 * The profile shown on the Profiles page, held in the `profile` URL param:
 * a profile id, `new`, or empty for the active profile.
 */
export function useSelectedProfile() {
  return useQueryState(
    "profile",
    parseAsString.withDefault("").withOptions({ clearOnDefault: true }),
  );
}
