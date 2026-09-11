"use client";

import { parseAsString, parseAsStringLiteral, useQueryState } from "nuqs";
import { BUG_AREAS } from "@/lib/forms/bug-report";

export const FEEDBACK_KINDS = ["bug", "feature"] as const;

/** Which form the /feedback page opens on. Absent inside the platform dialogs. */
export function useFeedbackKind() {
  return useQueryState(
    "kind",
    parseAsStringLiteral(FEEDBACK_KINDS).withDefault("bug"),
  );
}

/**
 * Bug area prefilled from the URL. The /feedback page is opened from elsewhere
 * (the desktop app's feedback window), so the caller names the area it was on
 * instead of the page guessing from its own pathname.
 */
export function useFeedbackArea() {
  const [area] = useQueryState("area", parseAsStringLiteral(BUG_AREAS));
  return area;
}

/**
 * Which build sent the report, e.g. "desktop 0.15.0 macOS 15". The web app
 * leaves this unset and the server falls back to the user-agent header.
 */
export function useFeedbackClient() {
  const [client] = useQueryState("client", parseAsString);
  return client?.trim() ? client.trim().slice(0, 120) : undefined;
}
