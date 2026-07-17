import { interchangeToContent, type ResumeContent } from "./codec";
import { interchangeSchema } from "./schema";

export interface InterchangeIssue {
  path: string;
  message: string;
}

/** Shared result shape for every text serialization (JSON files, YAML editor). */
export type ParseInterchangeResult =
  | { ok: true; content: ResumeContent }
  | { ok: false; kind: "syntax"; message: string }
  | { ok: false; kind: "schema"; issues: InterchangeIssue[] };

function formatPath(path: readonly PropertyKey[]): string {
  let out = "";
  for (const part of path) {
    if (typeof part === "number") out += `[${part}]`;
    else out += out ? `.${String(part)}` : String(part);
  }
  return out || "document";
}

/** Validate an already-deserialized document; never partially applies bad input. */
export function validateInterchange(data: unknown): ParseInterchangeResult {
  const parsed = interchangeSchema.safeParse(data);
  if (!parsed.success) {
    return {
      ok: false,
      kind: "schema",
      issues: parsed.error.issues.map((issue) => ({
        path: formatPath(issue.path),
        message: issue.message,
      })),
    };
  }
  return { ok: true, content: interchangeToContent(parsed.data) };
}
