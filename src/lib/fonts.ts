/**
 * The catalog of document fonts offered in the editor. Every family is
 * OFL-licensed and self-hosted as static TTFs under `/fonts`, so the on-screen
 * preview and the PDF export render from the exact same files and can never
 * drift apart. A résumé references a font by `id`; an absent or unknown id
 * means "template default" (the families the template ships with).
 */

export type FontCategory = "sans" | "serif" | "mono";

export type FontId =
  | "inter"
  | "carlito"
  | "arimo"
  | "roboto"
  | "open-sans"
  | "source-sans-3"
  | "lora"
  | "tinos"
  | "eb-garamond"
  | "source-serif-4"
  | "merriweather"
  | "geist-mono"
  | "jetbrains-mono"
  | "courier-prime"
  | "ibm-plex-mono";

export interface FontFace {
  /** File name under `/fonts/`. */
  file: string;
  weight: 400 | 600 | 700;
  style: "normal" | "italic";
}

export interface FontSummary {
  id: FontId;
  /** Family name used by both CSS `@font-face` and react-pdf registration. */
  family: string;
  category: FontCategory;
  faces: FontFace[];
}

/**
 * The standard face set for a family whose files follow the
 * `<Prefix>-<Variant>.ttf` naming. `semibold` and `italics` are opt-out for
 * families that don't ship those styles; weights a family lacks resolve to the
 * nearest registered weight in both CSS and react-pdf.
 */
function faceSet(
  prefix: string,
  options: { semibold?: boolean; italics?: boolean } = {},
): FontFace[] {
  const { semibold = true, italics = true } = options;
  const faces: FontFace[] = [
    { file: `${prefix}-Regular.ttf`, weight: 400, style: "normal" },
  ];
  if (semibold) {
    faces.push({
      file: `${prefix}-SemiBold.ttf`,
      weight: 600,
      style: "normal",
    });
  }
  faces.push({ file: `${prefix}-Bold.ttf`, weight: 700, style: "normal" });
  if (italics) {
    faces.push(
      { file: `${prefix}-Italic.ttf`, weight: 400, style: "italic" },
      { file: `${prefix}-BoldItalic.ttf`, weight: 700, style: "italic" },
    );
  }
  return faces;
}

/** Catalog order is dropdown order: sans, then serif, then mono. */
export const FONTS: FontSummary[] = [
  { id: "inter", family: "Inter", category: "sans", faces: faceSet("Inter") },
  {
    id: "carlito",
    family: "Carlito",
    category: "sans",
    faces: faceSet("Carlito", { semibold: false }),
  },
  { id: "arimo", family: "Arimo", category: "sans", faces: faceSet("Arimo") },
  {
    id: "roboto",
    family: "Roboto",
    category: "sans",
    faces: faceSet("Roboto"),
  },
  {
    id: "open-sans",
    family: "OpenSans",
    category: "sans",
    faces: faceSet("OpenSans"),
  },
  {
    id: "source-sans-3",
    family: "SourceSans3",
    category: "sans",
    faces: faceSet("SourceSans3"),
  },
  {
    id: "lora",
    family: "Lora",
    category: "serif",
    faces: faceSet("Lora", { semibold: false }),
  },
  {
    id: "tinos",
    family: "Tinos",
    category: "serif",
    faces: faceSet("Tinos", { semibold: false }),
  },
  {
    id: "eb-garamond",
    family: "EBGaramond",
    category: "serif",
    faces: faceSet("EBGaramond"),
  },
  {
    id: "source-serif-4",
    family: "SourceSerif4",
    category: "serif",
    faces: faceSet("SourceSerif4"),
  },
  {
    id: "merriweather",
    family: "Merriweather",
    category: "serif",
    faces: faceSet("Merriweather"),
  },
  {
    id: "geist-mono",
    family: "GeistMono",
    category: "mono",
    faces: faceSet("GeistMono", { semibold: false, italics: false }),
  },
  {
    id: "jetbrains-mono",
    family: "JetBrainsMono",
    category: "mono",
    faces: faceSet("JetBrainsMono"),
  },
  {
    id: "courier-prime",
    family: "CourierPrime",
    category: "mono",
    faces: faceSet("CourierPrime", { semibold: false }),
  },
  {
    id: "ibm-plex-mono",
    family: "IBMPlexMono",
    category: "mono",
    faces: faceSet("IBMPlexMono"),
  },
];

/** Human-readable names shown in the dropdown; ids stay machine-friendly. */
export const FONT_LABELS: Record<FontId, string> = {
  inter: "Inter",
  carlito: "Carlito",
  arimo: "Arimo",
  roboto: "Roboto",
  "open-sans": "Open Sans",
  "source-sans-3": "Source Sans 3",
  lora: "Lora",
  tinos: "Tinos",
  "eb-garamond": "EB Garamond",
  "source-serif-4": "Source Serif 4",
  merriweather: "Merriweather",
  "geist-mono": "Geist Mono",
  "jetbrains-mono": "JetBrains Mono",
  "courier-prime": "Courier Prime",
  "ibm-plex-mono": "IBM Plex Mono",
};

/**
 * Resolves a persisted font id to a catalog entry, or null when the id is
 * absent or unknown. Null means "template default": renderers keep the
 * families the template ships with.
 */
export function resolveFont(id: string | undefined): FontSummary | null {
  if (!id) return null;
  return FONTS.find((font) => font.id === id) ?? null;
}
