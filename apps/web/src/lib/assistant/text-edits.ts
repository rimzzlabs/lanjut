import { A, R, S } from "@mobily/ts-belt";

export interface TextEdit {
  old_str: string;
  new_str: string;
}

function occurrences(text: string, part: string): number {
  return A.length(S.split(text, part)) - 1;
}

function applyOne(
  text: string,
  edit: TextEdit,
  index: number,
): R.Result<string, string> {
  const count = occurrences(text, edit.old_str);
  if (count === 0) {
    return R.makeError(
      `\`edits[${index}].old_str\` does not occur in the text. Copy it exactly from lanjut_get_resume, with the edits before it applied.`,
    );
  }
  if (count > 1) {
    return R.makeError(
      `\`edits[${index}].old_str\` occurs ${count} times. Add more of the lines around it, so it occurs once.`,
    );
  }
  // A function replacer, so a `$` in the new text stays as it is.
  return R.makeOk(text.replace(edit.old_str, () => edit.new_str));
}

/**
 * Applies exact replacements in order, all or none. Each `old_str` must occur
 * exactly once in the text that the edits before it left.
 */
export function applyTextEdits(
  text: string,
  edits: ReadonlyArray<TextEdit>,
): R.Result<string, string> {
  return A.reduceWithIndex(
    edits,
    R.makeOk<string, string>(text),
    (result, edit, index) =>
      R.flatMap(result, (current) => applyOne(current, edit, index)),
  );
}
