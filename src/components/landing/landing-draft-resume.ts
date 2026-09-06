import { type Resume, SEED_RESUME } from "@/lib/resume";
import type { LandingDraft } from "@/lib/store";

/**
 * The landing draft materialized as a full document: the sample resume with
 * the visitor's own name and title layered over it. Used identically by the
 * live preview, the in-browser parser proof, and the create handoff, so what
 * the visitor sees, what gets verified, and what lands in the editor are the
 * same document.
 */
export function draftToResume(draft: LandingDraft): Resume {
  const resume = structuredClone(SEED_RESUME);
  const fields = resume.header.fields;
  if (draft.firstName.trim()) {
    fields.firstName = { kind: "plain", value: draft.firstName.trim() };
  }
  if (draft.lastName.trim()) {
    fields.lastName = { kind: "plain", value: draft.lastName.trim() };
  }
  if (draft.jobTitle.trim()) {
    fields.jobTitle = { kind: "plain", value: draft.jobTitle.trim() };
  }
  return resume;
}

export function draftFullName(draft: LandingDraft): string {
  return [draft.firstName.trim(), draft.lastName.trim()]
    .filter(Boolean)
    .join(" ");
}

export function draftHasContent(draft: LandingDraft): boolean {
  return Boolean(
    draft.firstName.trim() || draft.lastName.trim() || draft.jobTitle.trim(),
  );
}
