import { A, O, pipe, S } from "@mobily/ts-belt";

// A parser message can carry a code excerpt on the lines after the first,
// which the first line introduces with a colon.
export function firstLine(message: string): string {
  return pipe(
    message,
    S.split("\n"),
    A.head,
    O.getWithDefault(message),
    S.replaceByRe(/:\s*$/, ""),
  );
}
