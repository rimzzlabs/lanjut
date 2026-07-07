import { z } from "zod";
import { requiredRichTextDoc, richTextDoc } from "./rich-text";

type Translator = (key: string) => string;

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

export function createBugReportSchema(t: Translator) {
  return z.object({
    whatHappened: requiredRichTextDoc(t("bugWhatHappened")),
    steps: richTextDoc,
    area: z.enum(BUG_AREAS),
  });
}

export type BugReportForm = z.infer<ReturnType<typeof createBugReportSchema>>;
