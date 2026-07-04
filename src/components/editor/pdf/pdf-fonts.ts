import { Font } from "@react-pdf/renderer";

let registered = false;

/**
 * Registers the font families the PDF templates use, matching the on-screen
 * preview: Inter (sans, all templates) and Lora (serif accents in Ketat/Luasa).
 * Idempotent — safe to call before every render. Hyphenation is disabled so
 * react-pdf never injects soft hyphens that would corrupt text extraction
 * (pdftotext / ATS parsers must see whole words in reading order).
 */
export function registerPdfFonts(): void {
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

  Font.register({
    family: "Lora",
    fonts: [
      { src: "/fonts/Lora-Regular.ttf", fontWeight: 400 },
      { src: "/fonts/Lora-Bold.ttf", fontWeight: 700 },
      { src: "/fonts/Lora-Italic.ttf", fontWeight: 400, fontStyle: "italic" },
      {
        src: "/fonts/Lora-BoldItalic.ttf",
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
