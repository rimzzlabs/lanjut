import { z } from "zod";

export const SECTION_TITLE_MAX_LENGTH = 50;

type Translator = (key: string, values?: Record<string, unknown>) => string;

/**
 * Validation for a custom section's title, used by the add and rename dialogs.
 * `trim` runs before the checks, so the parsed submit value is already trimmed;
 * a title is required (non-empty) and capped so it stays a single heading line.
 */
export function createSectionTitleSchema(t: Translator) {
  return z.object({
    title: z
      .string()
      .trim()
      .min(1, t("sectionTitleRequired"))
      .max(
        SECTION_TITLE_MAX_LENGTH,
        t("titleMax", { max: SECTION_TITLE_MAX_LENGTH }),
      ),
  });
}

export type SectionTitleForm = z.infer<
  ReturnType<typeof createSectionTitleSchema>
>;
