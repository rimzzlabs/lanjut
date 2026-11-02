import type { ResumeDoc } from "./migrations-shared";

/**
 * v26→v27: the document gains the optional `colors` and `contactLabels`.
 * Absence keeps the template's colors and the full addresses, so nothing is
 * reshaped. The read sanitizes both (`allowedColors`, `usableContactLabels`),
 * so a malformed value renders as absent and stays stored as it was.
 */
export function migrateV26toV27(doc: ResumeDoc): ResumeDoc {
  return structuredClone(doc);
}
