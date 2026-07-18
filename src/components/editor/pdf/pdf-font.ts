import type { Styles } from "@react-pdf/renderer";
import { createContext, useContext } from "react";
import { resolveFont } from "@/lib/fonts";
import type { ResumePreview } from "../resume-preview";

type PdfStyle = Styles[string];

/**
 * Document-level font family override for a PDF render; null means the
 * template's shipped families apply. Provided once per document so nested
 * template components don't thread the family through props.
 */
export const PdfFontContext = createContext<string | null>(null);

/**
 * The family a template style should render with: the document override when
 * set, otherwise `fallback` (the family the template ships for that style).
 */
export function usePdfFontFamily(fallback: string): string {
  return useContext(PdfFontContext) ?? fallback;
}

interface PdfTypography {
  /** Override family for PdfFontContext, or null for template families. */
  family: string | null;
  /** Page-level style overrides, or null when template defaults fully apply. */
  page: PdfStyle | null;
}

/**
 * The document-level typography overrides a PDF template applies at its Page:
 * font family, tracking, and line height all inherit from the Page in
 * react-pdf, so one style array entry covers the whole document (explicit
 * per-element styles, e.g. a serif accent or a name's tight leading, still
 * win, matching the preview's behavior). An absent line height keeps the
 * template's own page baseline.
 */
export function pdfTypography(preview: ResumePreview): PdfTypography {
  const family = resolveFont(preview.font ?? undefined)?.family ?? null;
  const page: PdfStyle = {};
  if (family) page.fontFamily = family;
  if (preview.letterSpacing !== 0) page.letterSpacing = preview.letterSpacing;
  if (preview.lineHeight != null) page.lineHeight = preview.lineHeight;
  return { family, page: Object.keys(page).length > 0 ? page : null };
}
