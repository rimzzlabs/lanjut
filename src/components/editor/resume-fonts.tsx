import type { CSSProperties } from "react";
import { FONTS, resolveFont } from "@/lib/fonts";

/**
 * CSS variables scoping the résumé's fonts to a preview subtree. With no
 * override the template defaults apply (Inter sans, Lora serif, GeistMono
 * mono, matching the PDF registrations); an override points all three slots at
 * the chosen family so the whole document renders in it. Always set from the
 * self-hosted faces so the preview matches the PDF export exactly.
 */
export function resumeFontVars(fontId: string | null): CSSProperties {
  const override = resolveFont(fontId ?? undefined);
  return {
    "--font-sans": `${override?.family ?? "Inter"}, ui-sans-serif, system-ui, sans-serif`,
    "--font-serif": `${override?.family ?? "Lora"}, ui-serif, Georgia, serif`,
    "--font-geist-mono": `${override?.family ?? "GeistMono"}, ui-monospace, monospace`,
  } as CSSProperties;
}

const FONT_FACE_CSS = FONTS.flatMap((font) =>
  font.faces.map(
    (face) =>
      `@font-face{font-family:"${font.family}";src:url("/fonts/${face.file}") format("truetype");font-weight:${face.weight};font-style:${face.style};font-display:swap;}`,
  ),
).join("\n");

/**
 * Declares every catalog face once. Declarations are free: a browser only
 * downloads a face when rendered text actually uses its family, so the whole
 * catalog can be declared while only the selected font is fetched. React
 * hoists and dedupes the tag by `href`, so it can be rendered by both the
 * editor preview and every thumbnail.
 */
export function ResumeFontFaces() {
  return (
    <style href="resume-font-faces" precedence="low">
      {FONT_FACE_CSS}
    </style>
  );
}
