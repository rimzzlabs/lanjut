import { z } from "zod";
import { requiredRichTextDoc, richTextDoc } from "./rich-text";

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

export const bugReportSchema = z.object({
  whatHappened: requiredRichTextDoc("Describe what went wrong."),
  steps: richTextDoc,
  area: z.enum(BUG_AREAS),
});

export type BugReportForm = z.infer<typeof bugReportSchema>;
