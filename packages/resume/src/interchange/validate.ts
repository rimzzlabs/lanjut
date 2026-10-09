import { A } from "@mobily/ts-belt";
import { interchangeToContent, type ResumeContent } from "./codec";
import { interchangeSchema } from "./schema";

export interface InterchangeIssue {
  path: string;
  message: string;
}

/** Shared result shape for every text serialization (JSON and YAML, from a file or pasted). */
export type ParseInterchangeResult =
  | { ok: true; content: ResumeContent }
  | { ok: false; kind: "syntax"; message: string }
  | { ok: false; kind: "schema"; issues: ReadonlyArray<InterchangeIssue> };

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
      issues: A.map(parsed.error.issues, (issue) => ({
        path: formatPath(issue.path),
        message: issue.message,
      })),
    };
  }
  return { ok: true, content: interchangeToContent(parsed.data) };
}
