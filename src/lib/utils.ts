import { A, G, pipe, S } from "@mobily/ts-belt";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

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
