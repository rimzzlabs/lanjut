import type { JSONContent } from "@tiptap/core";
import { z } from "zod";

export const PROFILE_NAME_MAX_LENGTH = 60;

type Translator = (key: string, values?: Record<string, unknown>) => string;

/**
 * A profile: its own name, then the résumé header fields and the summary it
 * fills new résumés with. Only the name is required; every other field may
 * stay empty, as it may on a résumé.
 */
export function createProfileSchema(t: Translator) {
  const text = z.string();
  return z.object({
    name: z
      .string()
      .trim()
      .min(1, t("profileNameRequired"))
      .max(
        PROFILE_NAME_MAX_LENGTH,
        t("titleMax", { max: PROFILE_NAME_MAX_LENGTH }),
      ),
    photo: text,
    firstName: text,
    lastName: text,
    jobTitle: text,
    email: text,
    phone: text,
    website: text,
    linkedin: text,
    link: text,
    city: text,
    province: text,
    country: text,
    summary: z.custom<JSONContent>(
      (value) => typeof value === "object" && value !== null,
    ),
  });
}

export type ProfileForm = z.infer<ReturnType<typeof createProfileSchema>>;
