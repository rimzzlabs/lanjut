import { z } from "zod";
import { requiredRichTextDoc } from "./rich-text";

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
    name: z.string().trim().min(1, t("reporterNameRequired")).max(80),
    area: z.enum(BUG_AREAS),
    whatHappened: requiredRichTextDoc(t("bugWhatHappened")),
    turnstileToken: z.string().min(1, t("verificationRequired")),
  });
}

export type BugReportForm = z.infer<ReturnType<typeof createBugReportSchema>>;
