import { Font } from "@react-pdf/renderer";

let registered = false;

/**
 * Registers the Inter faces the Awal PDF uses, matching the on-screen preview.
 * Idempotent — safe to call before every render. Hyphenation is disabled so
 * react-pdf never injects soft hyphens that would corrupt text extraction
 * (pdftotext / ATS parsers must see whole words in reading order).
 */
export function registerAwalFonts(): void {
  if (registered) return;
  registered = true;

  Font.register({
    family: "Inter",
    fonts: [
      { src: "/fonts/Inter-Regular.ttf", fontWeight: 400 },
      { src: "/fonts/Inter-SemiBold.ttf", fontWeight: 600 },
      { src: "/fonts/Inter-Bold.ttf", fontWeight: 700 },
      { src: "/fonts/Inter-Italic.ttf", fontWeight: 400, fontStyle: "italic" },
      {
        src: "/fonts/Inter-BoldItalic.ttf",
        fontWeight: 700,
        fontStyle: "italic",
      },
    ],
  });

  Font.registerHyphenationCallback((word) => [word]);
}

export const PDF_COLORS = {
  foreground: "#0a0a0a",
  muted: "#525252",
  border: "#a3a3a3",
} as const;
