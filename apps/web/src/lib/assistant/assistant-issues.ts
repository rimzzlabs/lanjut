import type {
  InterchangeIssue,
  ParseInterchangeResult,
} from "@lanjut/resume/interchange";
import { A, O, pipe, S } from "@mobily/ts-belt";

type ParseFailure = Extract<ParseInterchangeResult, { ok: false }>;

const SECTION_PATH = /^sections\[(\d+)\](?:\.entries\[(\d+)\])?/;

/** The 1-based numbers of the lines that start with this heading mark. */
function headingLines(lines: ReadonlyArray<string>, mark: string) {
  return pipe(
    lines,
    A.mapWithIndex((index, line) => ({ index, line })),
    A.filter((item) => S.startsWith(item.line, mark)),
    A.map((item) => item.index + 1),
  );
}

/**
 * The line of the `##` heading of the section that a path names, or of the
 * `###` heading of its entry. The sections of the text come in its order.
 */
function lineOf(text: string, path: string): O.Option<number> {
  const match = SECTION_PATH.exec(path);
  if (!match) return O.None;
  const lines = S.split(text, "\n");
  const section = A.get(headingLines(lines, "## "), Number(match[1]));
  if (O.isNone(section) || match[2] === undefined) return section;
  const entry = pipe(
    headingLines(lines, "### "),
    A.filter((line) => line > section),
    A.get(Number(match[2])),
  );
  return O.isSome(entry) ? entry : section;
}

function issueLine(text: string, issue: InterchangeIssue): string {
  const where = O.mapWithDefault(
    lineOf(text, issue.path),
    "",
    (line) => ` (near line ${line})`,
  );
  return `- ${issue.path}${where}: ${issue.message}`;
}

/** Why the text did not reach the résumé, for the model to repair it. */
export function failureMessage(text: string, failure: ParseFailure): string {
  const head =
    "Lanjut did not apply the text, because it has an error. The résumé did not change.";
  if (failure.kind === "syntax") return `${head}\n${failure.message}`;
  const issues = pipe(
    failure.issues,
    A.map((issue) => issueLine(text, issue)),
    A.join("\n"),
  );
  return `${head}\n${issues}`;
}

export function ignoredMessage(count: number): string {
  return `Lanjut did not apply the text: ${count} block(s) of it have no field in their section, so they would be lost. Keep the headings and the labels that lanjut_get_resume gives, and put the text under a field.`;
}
