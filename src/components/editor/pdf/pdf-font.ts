import { createContext, useContext } from "react";

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
