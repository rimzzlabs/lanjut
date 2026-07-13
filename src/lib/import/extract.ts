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
    const lines: string[] = [];
    for (let page = 1; page <= pdf.numPages; page += 1) {
      const content = await (await pdf.getPage(page)).getTextContent();
      let buffer = "";
      for (const item of content.items) {
        if (!("str" in item)) continue;
        buffer += item.str;
        if ((item as { hasEOL?: boolean }).hasEOL) buffer += "\n";
      }
      lines.push(
        ...pipe(
          buffer.split("\n"),
          A.map((line) => line.replace(/\s+/g, " ").trim()),
          A.reject(S.isEmpty),
        ),
      );
    }
    const text = lines.join("\n").trim();
    if (!text) return { ok: false, reason: "empty" };
    return { ok: true, text };
  } catch (error) {
    const message = String(
      (error as { message?: unknown })?.message ?? error,
    ).toLowerCase();
    if (message.includes("password") || message.includes("encrypt")) {
      return { ok: false, reason: "encrypted" };
    }
    return { ok: false, reason: "error" };
  }
}
