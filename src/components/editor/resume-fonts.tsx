import type { CSSProperties } from "react";
import { FONTS, resolveFont } from "@/lib/fonts";
import { TEMPLATE_LINE_HEIGHT, type TemplateId } from "@/lib/templates";
import type { ResumePreview } from "./resume-preview";

type TypographySlice = Pick<
  ResumePreview,
  "font" | "letterSpacing" | "lineHeight"
>;

/**
 * Inline style scoping the résumé's typography to a preview subtree.
 *
 * Fonts are CSS variables: with no override the template defaults apply (Inter
 * sans, Lora serif, GeistMono mono, matching the PDF registrations); an
 * override points all three slots at the chosen family. Always set from the
 * self-hosted faces so the preview matches the PDF export exactly.
 *
 * Letter spacing inherits natively. Line height is always resolved (the
 * document value, else the template baseline) and carried by the inheriting
 * `--resume-line-height` variable that the rich-text body's leading consumes
 * (Tailwind's `--tw-leading` is registered non-inheriting, so it can't carry
 * a document-wide value); this keeps the on-screen body rhythm identical to
 * the PDF page's. Single-line accents (names, headings, dates) keep their
 * size-specific leading, mirroring the PDF's explicit per-element styles.
 */
export function resumeTypographyStyle(
  resume: TypographySlice,
  template: TemplateId,
): CSSProperties {
  const override = resolveFont(resume.font ?? undefined);
  const lineHeight = resume.lineHeight ?? TEMPLATE_LINE_HEIGHT[template];
  const style: CSSProperties = {
    "--font-sans": `${override?.family ?? "Inter"}, ui-sans-serif, system-ui, sans-serif`,
    "--font-serif": `${override?.family ?? "Lora"}, ui-serif, Georgia, serif`,
    "--font-geist-mono": `${override?.family ?? "GeistMono"}, ui-monospace, monospace`,
    lineHeight,
  } as CSSProperties;
  (style as Record<string, unknown>)["--resume-line-height"] =
    String(lineHeight);
  if (resume.letterSpacing !== 0) {
    style.letterSpacing = `${resume.letterSpacing}px`;
  }
  return style;
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
