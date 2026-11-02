import { A, D, G, O, pipe, S } from "@mobily/ts-belt";

/** The parts of a résumé that take a color the person picks. */
export type ColorPart = "name" | "heading" | "rule" | "link";

export const COLOR_PARTS: ReadonlyArray<ColorPart> = [
  "name",
  "heading",
  "rule",
  "link",
];

/** Colors as `#rrggbb`. An absent part keeps the template's own color. */
export type ResumeColors = Partial<Record<ColorPart, string>>;

/**
 * WCAG AA on the white paper: 4.5:1 for text, 3:1 for a rule, which is a
 * graphic (WCAG 1.4.11). AAA text is 7:1.
 */
export const TEXT_CONTRAST_MIN = 4.5;
export const RULE_CONTRAST_MIN = 3;
export const TEXT_CONTRAST_AAA = 7;

export type ContrastLevel = "AAA" | "AA" | "low";

export type SwatchId =
  | "navy"
  | "blue"
  | "teal"
  | "green"
  | "red"
  | "purple"
  | "rust"
  | "slate";

/** Colors that pass AA as text on the paper, so each one fits every part. */
export const COLOR_SWATCHES: ReadonlyArray<{ id: SwatchId; hex: string }> = [
  { id: "navy", hex: "#1e3a8a" },
  { id: "blue", hex: "#1d4ed8" },
  { id: "teal", hex: "#0f766e" },
  { id: "green", hex: "#15803d" },
  { id: "red", hex: "#b91c1c" },
  { id: "purple", hex: "#6d28d9" },
  { id: "rust", hex: "#9a3412" },
  { id: "slate", hex: "#334155" },
];

const HEX = /^#[0-9a-f]{6}$/;

function expandShortHex(raw: string): string {
  if (S.length(raw) !== 3) return raw;
  return pipe(
    S.split(raw, ""),
    A.map((digit) => `${digit}${digit}`),
    A.join(""),
  );
}

/** `#RGB` or `#RRGGBB`, with or without the `#`, as lowercase `#rrggbb`. */
export function normalizeHex(input: string): O.Option<string> {
  const raw = pipe(S.trim(input), S.toLowerCase, S.replaceByRe(/^#/, ""));
  const hex = `#${expandShortHex(raw)}`;
  return HEX.test(hex) ? O.Some(hex) : O.None;
}

function channel(hex: string, start: number): number {
  const value = Number.parseInt(S.slice(hex, start, start + 2), 16) / 255;
  return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
}

function luminance(hex: string): number {
  return (
    0.2126 * channel(hex, 1) +
    0.7152 * channel(hex, 3) +
    0.0722 * channel(hex, 5)
  );
}

/** The WCAG contrast ratio of a `#rrggbb` color on the white paper. */
export function contrastOnPaper(hex: string): number {
  return 1.05 / (luminance(hex) + 0.05);
}

export function contrastFloor(part: ColorPart): number {
  return part === "rule" ? RULE_CONTRAST_MIN : TEXT_CONTRAST_MIN;
}

export function contrastLevel(part: ColorPart, hex: string): ContrastLevel {
  const ratio = contrastOnPaper(hex);
  if (part !== "rule" && ratio >= TEXT_CONTRAST_AAA) return "AAA";
  return ratio >= contrastFloor(part) ? "AA" : "low";
}

/** Whether a stored value is a `#rrggbb` color that the part allows. */
export function isAllowedColor(part: ColorPart, value: unknown): boolean {
  if (!G.isString(value) || !HEX.test(value)) return false;
  return contrastOnPaper(value) >= contrastFloor(part);
}

/** The colors that pass, from a value of unknown shape. */
export function allowedColors(value: unknown): ResumeColors {
  if (!G.isObject(value) || G.isArray(value)) return {};
  const record = value as Record<string, unknown>;
  return pipe(
    COLOR_PARTS,
    A.filter((part) => isAllowedColor(part, record[part])),
    A.map((part) => [part, record[part] as string] as const),
    D.fromPairs,
  );
}
