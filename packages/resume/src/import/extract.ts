import { A, pipe, S } from "@mobily/ts-belt";
import { getDocumentProxy } from "unpdf";

export type ExtractResult =
  | { ok: true; text: string }
  | { ok: false; reason: "empty" | "encrypted" | "error" };

/**
 * Extract a PDF's text as newline-separated lines, entirely in-process (unpdf
 * bundles pdf.js; no network, no server). Lines are reconstructed from pdf.js's
 * per-item `hasEOL` flag rather than the flat merged string, so section headings
 * and entries land on their own lines for the parser. Distinguishes the failure
 * modes the UI blocks on: no readable text (scanned/image-only) is `empty`, a
 * password-protected file is `encrypted`, anything else is `error`.
 */
export async function extractPdfText(
  bytes: Uint8Array,
): Promise<ExtractResult> {
  try {
    const pdf = await getDocumentProxy(bytes);
    let lines: ReadonlyArray<string> = [];
    for (let page = 1; page <= pdf.numPages; page += 1) {
      const content = await (await pdf.getPage(page)).getTextContent();
      const buffer = A.reduce(content.items, "", (acc, item) => {
        if (!("str" in item)) return acc;
        const eol = (item as { hasEOL?: boolean }).hasEOL ? "\n" : "";
        return acc + item.str + eol;
      });
      const pageLines = pipe(
        buffer,
        S.split("\n"),
        A.map(S.replaceByRe(/\s+/g, " ")),
        A.map(S.trim),
        A.reject(S.isEmpty),
      );
      lines = A.concat(lines, pageLines);
    }
    const text = pipe(lines, A.join("\n"), S.trim);
    if (S.isEmpty(text)) return { ok: false, reason: "empty" };
    return { ok: true, text };
  } catch (error) {
    const message = S.toLowerCase(
      String((error as { message?: unknown })?.message ?? error),
    );
    if (S.includes(message, "password") || S.includes(message, "encrypt")) {
      return { ok: false, reason: "encrypted" };
    }
    return { ok: false, reason: "error" };
  }
}
