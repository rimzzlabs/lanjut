import type { ImportResult, ParseOptions } from "./index";

/**
 * Run a PDF import, resolving with the parsed result. The heavy parsing stack
 * (pdf.js via unpdf, the heuristics) is code-split behind this dynamic import, so
 * it is downloaded only when a user actually imports and never enters the main
 * bundle. Runs on the main thread: pdf.js does not initialise cleanly inside a
 * module web worker under the app's bundler, and a text-PDF parse is quick
 * enough for the create dialog's loading state to cover. Any failure degrades to
 * a generic result the UI can block on rather than throwing.
 */
export async function runPdfImport(
  bytes: ArrayBuffer,
  options: ParseOptions,
): Promise<ImportResult> {
  try {
    const { importResumeFromPdf } = await import("./index");
    return await importResumeFromPdf(new Uint8Array(bytes), options);
  } catch {
    return { ok: false, reason: "error" };
  }
}
