import { z } from "zod";

export const RESUME_TITLE_MIN_LENGTH = 3;
export const RESUME_TITLE_MAX_LENGTH = 100;

/**
 * Validation for the résumé label used by the create and rename dialogs. `trim`
 * runs before the length checks, so the parsed submit value is already trimmed.
 */
export const resumeTitleSchema = z.object({
  title: z
    .string()
    .trim()
    .min(
      RESUME_TITLE_MIN_LENGTH,
      `Use at least ${RESUME_TITLE_MIN_LENGTH} characters.`,
    )
    .max(
      RESUME_TITLE_MAX_LENGTH,
      `Keep it to ${RESUME_TITLE_MAX_LENGTH} characters or fewer.`,
    ),
});

export type ResumeTitleForm = z.infer<typeof resumeTitleSchema>;

/** The create dialog adds the pre-fill opt-out on top of the shared title field. */
export const resumeCreateSchema = resumeTitleSchema.extend({
  prefill: z.boolean(),
});

export type ResumeCreateForm = z.infer<typeof resumeCreateSchema>;
