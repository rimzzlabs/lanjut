import type { JSONContent } from "@tiptap/core";
import { z } from "zod";

/** Must match the `area` dropdown options in .github/ISSUE_TEMPLATE/bug-report.yml. */
export const BUG_AREAS = [
  "Editor",
  "Résumé preview",
  "Templates",
  "Export (PDF / DOCX / TXT)",
  "Dashboard / library",
  "Landing page",
  "Other",
] as const;

function plainTextOf(node: JSONContent): string {
  if (node.type === "text") return node.text ?? "";
  return (node.content ?? []).map(plainTextOf).join("");
}

const richTextDoc = z.custom<JSONContent>(
  (value) => typeof value === "object" && value !== null,
);

export const bugReportSchema = z.object({
  whatHappened: richTextDoc.refine(
    (doc) => plainTextOf(doc).trim().length > 0,
    "Describe what went wrong.",
  ),
  steps: richTextDoc,
  area: z.enum(BUG_AREAS),
});

export type BugReportForm = z.infer<typeof bugReportSchema>;
