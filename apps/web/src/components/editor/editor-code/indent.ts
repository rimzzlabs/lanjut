import { A, O, pipe, S } from "@mobily/ts-belt";

const INDENT = "  ";
const LEADING = /^(?:\t| {1,2})/;

/** A change to a text field: the range to replace, its new text, and the selection after it. */
export interface TextEdit {
  from: number;
  to: number;
  insert: string;
  select: readonly [number, number];
}

interface Selection {
  value: string;
  start: number;
  end: number;
}

interface Lines {
  from: number;
  to: number;
  lines: ReadonlyArray<string>;
}

/** The whole lines that a selection touches. A selection that ends at the start of a line leaves that line out. */
function linesOf(selection: Selection): Lines {
  const { value, start } = selection;
  const endsAtLineStart =
    selection.end > start && S.get(value, selection.end - 1) === "\n";
  const end = endsAtLineStart ? selection.end - 1 : selection.end;
  const from = O.mapWithDefault(
    S.lastIndexOf(S.slice(value, 0, start), "\n"),
    0,
    (at) => at + 1,
  );
  const to = O.mapWithDefault(
    S.indexOf(S.sliceToEnd(value, end), "\n"),
    S.length(value),
    (at) => end + at,
  );
  return { from, to, lines: S.split(S.slice(value, from, to), "\n") };
}

function indentLine(line: string): string {
  if (S.isEmpty(line)) return line;
  return `${INDENT}${line}`;
}

/** Tab: two spaces at the caret, or two spaces before each selected line. */
export function indentEdit(selection: Selection): TextEdit {
  const { start, end } = selection;
  if (start === end) {
    const caret = start + S.length(INDENT);
    return { from: start, to: end, insert: INDENT, select: [caret, caret] };
  }
  const { from, to, lines } = linesOf(selection);
  const insert = pipe(lines, A.map(indentLine), A.join("\n"));
  return { from, to, insert, select: [from, from + S.length(insert)] };
}

/** Shift+Tab: one level off each line that the selection touches, or nothing when no line has one. */
export function outdentEdit(selection: Selection): TextEdit | undefined {
  const { start, end } = selection;
  const { from, to, lines } = linesOf(selection);
  const insert = pipe(lines, A.map(S.replaceByRe(LEADING, "")), A.join("\n"));
  if (S.length(insert) === to - from) return undefined;
  if (start !== end) {
    return { from, to, insert, select: [from, from + S.length(insert)] };
  }
  const first = O.getWithDefault(A.head(lines), "");
  const removed = S.length(first) - S.length(S.replaceByRe(first, LEADING, ""));
  const caret = Math.max(from, start - removed);
  return { from, to: from + removed, insert: "", select: [caret, caret] };
}
