import { Font } from "@react-pdf/renderer";
import { FONTS } from "@/lib/fonts";

let registered = false;

/**
 * Registers every font family in the catalog. Registration is metadata only;
 * react-pdf fetches a face's TTF only when the rendered document actually uses
 * it, so the full catalog costs nothing per export. Idempotent, safe to call
 * before every render. Hyphenation is disabled so react-pdf never injects soft
 * hyphens that would corrupt text extraction (pdftotext / ATS parsers must see
 * whole words in reading order).
 */
export function registerPdfFonts(): void {
  if (registered) return;
  registered = true;

  for (const font of FONTS) {
    Font.register({
      family: font.family,
      fonts: font.faces.map((face) => ({
        src: `/fonts/${face.file}`,
        fontWeight: face.weight,
        fontStyle: face.style,
      })),
    });
  }

  Font.registerHyphenationCallback((word) => [word]);
}

export const PDF_COLORS = {
  foreground: "#0a0a0a",
  muted: "#525252",
  border: "#a3a3a3",
} as const;
