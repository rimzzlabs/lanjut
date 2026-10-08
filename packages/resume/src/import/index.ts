import { extractPdfText } from "./extract";
import { type ParseOptions, type ParseResult, parseResumeText } from "./parse";

export type { ParseOptions, ParseResult } from "./parse";

export type ImportFailureReason = "empty" | "encrypted" | "error";

export type ImportResult =
  | ({ ok: true } & ParseResult)
  | { ok: false; reason: ImportFailureReason };

/**
 * Turn a PDF's bytes into a structured résumé plus its leftovers, fully on the
 * client. Returns a typed failure for the cases the UI blocks on (no text layer,
 * encrypted) instead of throwing.
 */
export async function importResumeFromPdf(
  bytes: Uint8Array,
  options: ParseOptions,
): Promise<ImportResult> {
  const extracted = await extractPdfText(bytes);
  if (!extracted.ok) return extracted;
  return { ok: true, ...parseResumeText(extracted.text, options) };
}
