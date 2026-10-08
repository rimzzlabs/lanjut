import { z } from "zod";

export const RESUME_TITLE_MIN_LENGTH = 3;
export const RESUME_TITLE_MAX_LENGTH = 100;

type Translator = (key: string, values?: Record<string, unknown>) => string;

/**
 * Validation for the résumé label used by the create and rename dialogs. `trim`
 * runs before the length checks, so the parsed submit value is already trimmed.
 */
export function createResumeTitleSchema(t: Translator) {
  return z.object({
    title: z
      .string()
      .trim()
      .min(
        RESUME_TITLE_MIN_LENGTH,
        t("titleMin", { min: RESUME_TITLE_MIN_LENGTH }),
      )
      .max(
        RESUME_TITLE_MAX_LENGTH,
        t("titleMax", { max: RESUME_TITLE_MAX_LENGTH }),
      ),
  });
}

export type ResumeTitleForm = z.infer<
  ReturnType<typeof createResumeTitleSchema>
>;

/** Where a newly created document's starting content comes from. */
export const RESUME_SOURCES = ["sample", "empty", "import"] as const;
export type ResumeSource = (typeof RESUME_SOURCES)[number];

/** The create dialog adds the content-source choice on top of the title field. */
export function createResumeCreateSchema(t: Translator) {
  return createResumeTitleSchema(t).extend({
    source: z.enum(RESUME_SOURCES),
  });
}

export type ResumeCreateForm = z.infer<
  ReturnType<typeof createResumeCreateSchema>
>;
