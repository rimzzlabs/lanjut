import { A, G, pipe, S } from "@mobily/ts-belt";

/** Joins the parts that hold text, skipping empty and missing ones. */
export function joinPresent(
  parts: ReadonlyArray<string | undefined>,
  separator: string,
) {
  return pipe(
    parts,
    A.filter(G.isString),
    A.reject(S.isEmpty),
    A.join(separator),
  );
}
