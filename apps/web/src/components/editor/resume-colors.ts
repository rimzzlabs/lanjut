import type { ColorPart, ResumeColors } from "@lanjut/resume/colors";
import { A, D, pipe } from "@mobily/ts-belt";

const ATTRIBUTES: Record<ColorPart, string> = {
  name: "data-name-color",
  heading: "data-heading-color",
  rule: "data-rule-color",
  link: "data-link-color",
};

const VARIABLES: Record<ColorPart, string> = {
  name: "--resume-name-color",
  heading: "--resume-heading-color",
  rule: "--resume-rule-color",
  link: "--resume-link-color",
};

function coloredParts(colors: ResumeColors): ReadonlyArray<ColorPart> {
  return D.keys(colors) as ReadonlyArray<ColorPart>;
}

/** Marks each colored part on the résumé root, for the rules in globals.css. */
export function resumeColorAttributes(
  colors: ResumeColors,
): Record<string, string> {
  return pipe(
    coloredParts(colors),
    A.map((part) => [ATTRIBUTES[part], ""] as const),
    D.fromPairs,
  );
}

/** The CSS variables that carry each colored part. */
export function resumeColorVariables(
  colors: ResumeColors,
): Record<string, string> {
  return pipe(
    coloredParts(colors),
    A.map((part) => [VARIABLES[part], colors[part] ?? ""] as const),
    D.fromPairs,
  );
}
