import { A, pipe, R } from "@mobily/ts-belt";
import { z } from "zod";

// The same limits as `src-tauri/src/mcp/args.rs`. The desktop app checks the
// arguments first, and the page checks them again, because it must not trust
// what reaches it.
const MAX_TEXT = 200_000;
const MAX_EDITS = 50;
const MAX_ID = 128;

const id = z.string().max(MAX_ID).regex(/\S/, "is empty");
const revision = z.number().int().nonnegative();
const text = z.string().max(MAX_TEXT);

export const resumeIdArgs = z.object({ id });

export const getResumeArgs = z.object({
  id,
  format: z.enum(["markdown", "yaml", "json"]).default("markdown"),
});

const textEditArgs = z.object({
  old_str: text.min(1),
  new_str: text,
});

export const editResumeArgs = z.object({
  id,
  base_revision: revision,
  edits: z.array(textEditArgs).min(1).max(MAX_EDITS),
});

export const replaceResumeArgs = z.object({
  id,
  base_revision: revision,
  markdown: text.regex(/\S/, "is empty"),
});

const MAX_TITLE = 120;
const MAX_NAME = 80;
/** A photo file of 10 MB is 14 MB as base64. */
const MAX_PHOTO_BASE64 = 14_000_000;

const title = z.string().trim().min(1).max(MAX_TITLE);

export const RESETTABLE = [
  "font",
  "line_height",
  "name_scale",
  "title_scale",
  "body_scale",
  "name_color",
  "heading_color",
  "rule_color",
  "link_color",
] as const;
const color = z.string().max(16);

export const createResumeArgs = z.object({
  title,
  start: z.enum(["sample", "blank"]).default("blank"),
  template: z.string().max(MAX_ID).optional(),
});

export const duplicateResumeArgs = z.object({ id, title: title.optional() });

export const exportResumeArgs = z.object({
  id,
  format: z.enum(["pdf", "docx", "txt"]),
  file_name: z.string().trim().min(1).max(MAX_TITLE).optional(),
});

export const resumeSettingsArgs = z.object({
  id,
  base_revision: revision,
  title: title.optional(),
  template: z.string().max(MAX_ID).optional(),
  language: z.enum(["en", "id"]).optional(),
  font: z.string().max(MAX_ID).optional(),
  show_icons: z.boolean().optional(),
  section_spacing: z.number().optional(),
  letter_spacing: z.number().optional(),
  line_height: z.number().optional(),
  name_scale: z.number().optional(),
  title_scale: z.number().optional(),
  body_scale: z.number().optional(),
  colors: z
    .object({
      name: color.optional(),
      heading: color.optional(),
      rule: color.optional(),
      link: color.optional(),
    })
    .optional(),
  reset: z.array(z.enum(RESETTABLE)).max(RESETTABLE.length).default([]),
  profile_id: z.string().max(MAX_ID).optional(),
});

export const sectionOrderArgs = z.object({
  id,
  base_revision: revision,
  preset: z.enum(["experience-first", "skills-first"]).optional(),
  order: z.array(id).max(50).optional(),
  hidden: z.array(id).max(50).default([]),
  shown: z.array(id).max(50).default([]),
});

export const setPhotoArgs = z.object({
  id,
  base_revision: revision,
  image: z
    .object({
      mime: z.enum(["image/jpeg", "image/png", "image/webp", "image/gif"]),
      base64: z.string().min(1).max(MAX_PHOTO_BASE64),
    })
    .nullable(),
});

export const profileIdArgs = z.object({ id });

export const saveProfileArgs = z.object({
  id: id.optional(),
  base_revision: revision.optional(),
  name: z.string().trim().min(1).max(MAX_NAME).optional(),
  markdown: text.optional(),
});

function issueText(issue: z.core.$ZodIssue): string {
  const path = A.join(A.map(issue.path, String), ".");
  return path ? `\`${path}\` ${issue.message}` : issue.message;
}

/** The arguments of a tool call, or what is wrong with them, for the model. */
export function parseArgs<S extends z.ZodType>(
  schema: S,
  args: unknown,
): R.Result<z.infer<S>, string> {
  const parsed = schema.safeParse(args);
  if (parsed.success) return R.makeOk(parsed.data);
  return R.makeError(
    `The arguments are not valid: ${pipe(parsed.error.issues, A.map(issueText), A.join("; "))}.`,
  );
}
