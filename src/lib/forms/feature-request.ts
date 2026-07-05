import { z } from "zod";
import { requiredRichTextDoc } from "./rich-text";

/** Must match the `layer` dropdown options in .github/ISSUE_TEMPLATE/feature-request.yml. */
export const FEATURE_LAYERS = [
  "Presentation (typography, spacing, color, ordering)",
  "Editor experience (no change to the document itself)",
  "Export (PDF / DOCX / TXT)",
  "Other / not sure",
] as const;

export const featureRequestSchema = z.object({
  problem: requiredRichTextDoc("Describe the problem this would solve."),
  proposal: requiredRichTextDoc("Describe how you imagine it working."),
  layer: z.enum(FEATURE_LAYERS),
});

export type FeatureRequestForm = z.infer<typeof featureRequestSchema>;
