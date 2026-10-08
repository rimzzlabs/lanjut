import { emptyRichTextValue } from "@lanjut/resume";
import type { JSONContent } from "@tiptap/core";
import type { Control } from "react-hook-form";
import { z } from "zod";
import { isRichEmpty, richToMarkdown } from "./feedback-markdown";
import {
  BUG_FREQUENCIES,
  type BugFrequency,
  FEEDBACK_AREAS,
  FEEDBACK_LIMITS,
  type FeedbackArea,
  type FeedbackKind,
  type FeedbackReport,
  IDEA_IMPACTS,
  type IdeaImpact,
  WORDING_LANGUAGES,
  type WordingLanguage,
} from "./feedback-schema";

/**
 * Whether the reporter has a GitHub account. With one, they post the issue
 * themselves from a prefilled page; without one, the Worker posts it.
 */
export const FEEDBACK_ACCOUNTS = ["none", "github"] as const;
export type FeedbackAccount = (typeof FEEDBACK_ACCOUNTS)[number];

/**
 * Every field of every kind, in one form, so switching the kind keeps what
 * was typed. The long answers are rich text; they become Markdown on send.
 */
export interface FeedbackFormValues {
  kind: FeedbackKind;
  account: FeedbackAccount;
  title: string;
  area: FeedbackArea;
  steps: JSONContent;
  expected: JSONContent;
  actual: JSONContent;
  frequency: BugFrequency;
  goal: JSONContent;
  idea: JSONContent;
  workaround: JSONContent;
  impact: IdeaImpact;
  language: WordingLanguage;
  current: string;
  suggested: string;
  note: JSONContent;
  name: string;
}

type FieldsOfType<T> = {
  [K in keyof FeedbackFormValues]: FeedbackFormValues[K] extends T
    ? T extends FeedbackFormValues[K]
      ? K
      : never
    : never;
}[keyof FeedbackFormValues];

export type FeedbackTextField = Exclude<
  FieldsOfType<string>,
  "kind" | "account" | "area" | "frequency" | "impact" | "language"
>;
export type FeedbackRichField = FieldsOfType<JSONContent>;

/** The fields the details step checks before it moves on. */
export const DETAIL_FIELDS: Record<
  FeedbackKind,
  ReadonlyArray<keyof FeedbackFormValues>
> = {
  bug: ["title", "area", "steps", "expected", "actual", "frequency"],
  idea: ["title", "area", "goal", "idea", "workaround", "impact"],
  wording: ["area", "language", "current", "suggested", "note"],
};

export function defaultFeedbackValues(
  kind: FeedbackKind,
  area: FeedbackArea,
  language: WordingLanguage,
): FeedbackFormValues {
  return {
    kind,
    account: "none",
    title: "",
    area,
    steps: emptyRichTextValue(),
    expected: emptyRichTextValue(),
    actual: emptyRichTextValue(),
    frequency: "always",
    goal: emptyRichTextValue(),
    idea: emptyRichTextValue(),
    workaround: emptyRichTextValue(),
    impact: "time",
    language,
    current: "",
    suggested: "",
    note: emptyRichTextValue(),
    name: "",
  };
}

type Translator = (key: string, values?: Record<string, unknown>) => string;

const richDoc = z.custom<JSONContent>(
  (value) => typeof value === "object" && value !== null,
);

function requiredText(t: Translator, max: number) {
  return z
    .string()
    .trim()
    .min(1, t("feedbackRequired"))
    .max(max, t("titleMax", { max }));
}

function optionalText(t: Translator, max: number) {
  return z.string().trim().max(max, t("titleMax", { max }));
}

/** Rich text that must hold words, and must fit once written as Markdown. */
function requiredRich(t: Translator) {
  return richDoc
    .refine((doc) => !isRichEmpty(doc), t("feedbackRequired"))
    .refine(
      (doc) => richToMarkdown(doc).length <= FEEDBACK_LIMITS.long,
      t("titleMax", { max: FEEDBACK_LIMITS.long }),
    );
}

function optionalRich(t: Translator) {
  return richDoc.refine(
    (doc) => richToMarkdown(doc).length <= FEEDBACK_LIMITS.long,
    t("titleMax", { max: FEEDBACK_LIMITS.long }),
  );
}

/**
 * The form's own schema: the same rules as the report the Worker accepts,
 * with the long answers still rich text. `toFeedbackReport` writes them as
 * Markdown for sending.
 */
export function createFeedbackFormSchema(t: Translator) {
  const contact = { name: optionalText(t, FEEDBACK_LIMITS.name) };
  const title = requiredText(t, FEEDBACK_LIMITS.title);
  const area = z.enum(FEEDBACK_AREAS);
  return z.discriminatedUnion("kind", [
    z.object({
      kind: z.literal("bug"),
      title,
      area,
      steps: requiredRich(t),
      expected: requiredRich(t),
      actual: requiredRich(t),
      frequency: z.enum(BUG_FREQUENCIES),
      ...contact,
    }),
    z.object({
      kind: z.literal("idea"),
      title,
      area,
      goal: requiredRich(t),
      idea: requiredRich(t),
      workaround: optionalRich(t),
      impact: z.enum(IDEA_IMPACTS),
      ...contact,
    }),
    z.object({
      kind: z.literal("wording"),
      area,
      language: z.enum(WORDING_LANGUAGES),
      current: requiredText(t, FEEDBACK_LIMITS.short),
      suggested: optionalText(t, FEEDBACK_LIMITS.short),
      note: optionalRich(t),
      ...contact,
    }),
  ]);
}

export type FeedbackFormReport = z.infer<
  ReturnType<typeof createFeedbackFormSchema>
>;

/** The form's control: it edits the flat values and submits a parsed report. */
export type FeedbackControl = Control<
  FeedbackFormValues,
  unknown,
  FeedbackFormReport
>;

/** A checked form report, with its rich answers written as Markdown. */
export function toFeedbackReport(report: FeedbackFormReport): FeedbackReport {
  switch (report.kind) {
    case "bug":
      return {
        ...report,
        steps: richToMarkdown(report.steps),
        expected: richToMarkdown(report.expected),
        actual: richToMarkdown(report.actual),
      };
    case "idea":
      return {
        ...report,
        goal: richToMarkdown(report.goal),
        idea: richToMarkdown(report.idea),
        workaround: richToMarkdown(report.workaround),
      };
    case "wording":
      return { ...report, note: richToMarkdown(report.note) };
  }
}
