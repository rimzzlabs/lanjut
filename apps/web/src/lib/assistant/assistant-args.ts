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
