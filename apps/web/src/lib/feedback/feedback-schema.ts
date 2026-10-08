import { z } from "zod";

export const FEEDBACK_KINDS = ["bug", "idea", "wording"] as const;
export type FeedbackKind = (typeof FEEDBACK_KINDS)[number];

/** Where in Lanjut a report is about. Several map to a GitHub area label. */
export const FEEDBACK_AREAS = [
  "editor",
  "preview",
  "pdf",
  "word",
  "other-export",
  "import",
  "templates",
  "library",
  "desktop",
  "home",
  "other",
] as const;
export type FeedbackArea = (typeof FEEDBACK_AREAS)[number];

export const BUG_FREQUENCIES = ["always", "sometimes", "once"] as const;
export type BugFrequency = (typeof BUG_FREQUENCIES)[number];

export const IDEA_IMPACTS = ["nice", "time", "blocker"] as const;
export type IdeaImpact = (typeof IDEA_IMPACTS)[number];

export const WORDING_LANGUAGES = ["en", "id"] as const;
export type WordingLanguage = (typeof WORDING_LANGUAGES)[number];

export const FEEDBACK_LIMITS = {
  title: 90,
  name: 80,
  short: 500,
  long: 4000,
} as const;

/**
 * Facts about the build and the page, never the text of a résumé. The
 * reporter sees every one before sending and may leave them all out.
 */
export const feedbackDetailsSchema = z.object({
  app: z.string().max(40).optional(),
  platform: z.string().max(40).optional(),
  browser: z.string().max(60).optional(),
  os: z.string().max(60).optional(),
  language: z.string().max(40).optional(),
  page: z.string().max(60).optional(),
  template: z.string().max(40).optional(),
  font: z.string().max(60).optional(),
  documentLanguage: z.string().max(40).optional(),
});
export type FeedbackDetails = z.infer<typeof feedbackDetailsSchema>;

type Translator = (key: string, values?: Record<string, unknown>) => string;

function required(t: Translator, max: number) {
  return z
    .string()
    .trim()
    .min(1, t("feedbackRequired"))
    .max(max, t("titleMax", { max }));
}

function optional(t: Translator, max: number) {
  return z.string().trim().max(max, t("titleMax", { max }));
}

/**
 * Who sent it, when the Worker posts it for them. The name may stay empty:
 * the report is then anonymous.
 */
function contactShape(t: Translator) {
  return { name: optional(t, FEEDBACK_LIMITS.name) };
}

/**
 * One report of each kind. The client builds it with translated messages and
 * validates step by step; the Worker builds it with message keys and checks
 * the same shape again before filing anything.
 */
export function createFeedbackReportSchema(t: Translator) {
  const contact = contactShape(t);
  const title = required(t, FEEDBACK_LIMITS.title);
  const area = z.enum(FEEDBACK_AREAS);
  return z.discriminatedUnion("kind", [
    z.object({
      kind: z.literal("bug"),
      title,
      area,
      steps: required(t, FEEDBACK_LIMITS.long),
      expected: required(t, FEEDBACK_LIMITS.long),
      actual: required(t, FEEDBACK_LIMITS.long),
      frequency: z.enum(BUG_FREQUENCIES),
      ...contact,
    }),
    z.object({
      kind: z.literal("idea"),
      title,
      area,
      goal: required(t, FEEDBACK_LIMITS.long),
      idea: required(t, FEEDBACK_LIMITS.long),
      workaround: optional(t, FEEDBACK_LIMITS.long),
      impact: z.enum(IDEA_IMPACTS),
      ...contact,
    }),
    z.object({
      kind: z.literal("wording"),
      area,
      language: z.enum(WORDING_LANGUAGES),
      current: required(t, FEEDBACK_LIMITS.short),
      suggested: optional(t, FEEDBACK_LIMITS.short),
      note: optional(t, FEEDBACK_LIMITS.long),
      ...contact,
    }),
  ]);
}

export type FeedbackReport = z.infer<
  ReturnType<typeof createFeedbackReportSchema>
>;

/** The report without messages, as the Worker validates it. */
export const feedbackReportSchema = createFeedbackReportSchema((key) => key);

/** Wire format for POST /api/feedback. */
export const feedbackPayloadSchema = z.object({
  report: feedbackReportSchema,
  details: feedbackDetailsSchema.optional(),
  turnstileToken: z.string().min(1),
});
export type FeedbackPayload = z.infer<typeof feedbackPayloadSchema>;
