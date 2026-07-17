import { z } from "zod";
import { BUG_AREAS } from "./bug-report";
import { FEATURE_LAYERS } from "./feature-request";

const reporterName = z.string().trim().min(1).max(80);
const summary = z.string().trim().min(1).max(120);
const requiredMarkdown = z.string().trim().min(1).max(8000);

/** Wire format for POST /api/feedback; validated again on the server. */
export const feedbackPayloadSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("bug"),
    name: reporterName,
    turnstileToken: z.string().min(1),
    summary,
    whatHappened: requiredMarkdown,
    area: z.enum(BUG_AREAS),
  }),
  z.object({
    kind: z.literal("feature"),
    name: reporterName,
    turnstileToken: z.string().min(1),
    summary,
    problem: requiredMarkdown,
    layer: z.enum(FEATURE_LAYERS),
  }),
]);

export type FeedbackPayload = z.infer<typeof feedbackPayloadSchema>;
