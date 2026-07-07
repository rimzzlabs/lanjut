import { z } from "zod";
import { requiredRichTextDoc } from "./rich-text";

type Translator = (key: string) => string;

/** Must match the `layer` dropdown options in .github/ISSUE_TEMPLATE/feature-request.yml. */
export const FEATURE_LAYERS = [
  "Presentation (typography, spacing, color, ordering)",
  "Editor experience (no change to the document itself)",
  "Export (PDF / DOCX / TXT)",
  "Other / not sure",
] as const;

export function createFeatureRequestSchema(t: Translator) {
  return z.object({
    problem: requiredRichTextDoc(t("featureProblem")),
    proposal: requiredRichTextDoc(t("featureProposal")),
    layer: z.enum(FEATURE_LAYERS),
  });
}

export type FeatureRequestForm = z.infer<
  ReturnType<typeof createFeatureRequestSchema>
>;
