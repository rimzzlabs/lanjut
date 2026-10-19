import type { ImportResult, ParseOptions } from "@lanjut/resume/import";
import type { ExtractResult } from "@lanjut/resume/import/extract";
import type { TemplateId } from "@lanjut/resume/templates";
import type { ResumePreview } from "../resume-preview";

/**
 * The PDF work that runs off the main thread: what each job takes and what it
 * gives back. Every value crosses a thread, so each one is plain data.
 */
export interface PdfJobs {
  render: {
    input: { preview: ResumePreview; template: TemplateId };
    output: Uint8Array;
  };
  extract: { input: { bytes: Uint8Array }; output: ExtractResult };
  import: {
    input: { bytes: Uint8Array; options: ParseOptions };
    output: ImportResult;
  };
  warmUp: {
    input: { template: TemplateId; fontId: string | undefined };
    output: null;
  };
}

export type PdfJobKind = keyof PdfJobs;
export type PdfJobInput<K extends PdfJobKind> = PdfJobs[K]["input"];
export type PdfJobOutput<K extends PdfJobKind> = PdfJobs[K]["output"];

export type PdfJobRequest = {
  [K in PdfJobKind]: { kind: K; input: PdfJobInput<K> };
}[PdfJobKind];

export type PdfJobResponse =
  | { ok: true; output: PdfJobOutput<PdfJobKind> }
  | { ok: false; message: string };

type PdfJobRunners = {
  [K in PdfJobKind]: (input: PdfJobInput<K>) => Promise<PdfJobOutput<K>>;
};

async function render(input: PdfJobInput<"render">) {
  const { renderResumePdf } = await import("../takumi/render-resume-pdf");
  return renderResumePdf(input);
}

async function extract(input: PdfJobInput<"extract">) {
  const { extractPdfText } = await import("@lanjut/resume/import/extract");
  return extractPdfText(input.bytes);
}

async function importPdf(input: PdfJobInput<"import">) {
  const { importResumeFromPdf } = await import("@lanjut/resume/import");
  return importResumeFromPdf(input.bytes, input.options);
}

async function warmUp(input: PdfJobInput<"warmUp">) {
  const { warmUpResumePdf } = await import("../takumi/render-resume-pdf");
  await warmUpResumePdf(input);
  return null;
}

const RUNNERS: PdfJobRunners = {
  render,
  extract,
  import: importPdf,
  warmUp,
};

/** Runs one job on the current thread. Each module loads on its first job. */
export function runPdfJob<K extends PdfJobKind>(
  kind: K,
  input: PdfJobInput<K>,
): Promise<PdfJobOutput<K>> {
  return RUNNERS[kind](input);
}

/**
 * The buffer a job hands over instead of copying: its PDF bytes. The sender
 * loses access to them, as pdf.js already takes the buffer it reads.
 */
export function transferList(value: unknown): Transferable[] {
  if (value instanceof Uint8Array) return [value.buffer as ArrayBuffer];
  if (
    typeof value === "object" &&
    value !== null &&
    "bytes" in value &&
    value.bytes instanceof Uint8Array
  ) {
    return [value.bytes.buffer as ArrayBuffer];
  }
  return [];
}
