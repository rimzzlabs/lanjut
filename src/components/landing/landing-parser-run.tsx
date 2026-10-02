import { A, O, pipe, R, S } from "@mobily/ts-belt";
import { resumeToPreview } from "@/components/editor/resume-to-preview";
import type { Resume } from "@/lib/resume";
import type { TemplateId } from "@/lib/templates";
import { joinPresent } from "@/lib/utils";

export type ParserPhase = "render" | "extract" | "check";

export interface ParserProofReport {
  pdfKb: number;
  chars: number;
  excerpt: ReadonlyArray<string>;
  name: string;
  nameFound: boolean;
  titleFound: boolean;
  employerFound: boolean;
  emailFound: boolean;
  orderOk: boolean;
  order: string[];
}

const SECTION_ORDER = ["SUMMARY", "EXPERIENCE", "EDUCATION", "SKILLS"];

function plainValue(field: unknown): string {
  if (field && typeof field === "object" && "value" in field) {
    const value = (field as { value?: unknown }).value;
    if (typeof value === "string") return value;
  }
  return "";
}

interface RunParserProofParams {
  resume: Resume;
  template: TemplateId;
  onPhase: (phase: ParserPhase) => void;
}

/**
 * The landing page's proof run: renders the given document to a real PDF with
 * the real export pipeline, extracts its text with the same parser the import
 * feature uses, and checks what an ATS would check. Everything happens in the
 * visitor's browser; every heavy module loads lazily on first run.
 */
export async function runParserProof(
  params: RunParserProofParams,
): Promise<R.Result<ParserProofReport, string>> {
  const { resume, template, onPhase } = params;
  onPhase("render");
  const { renderResumePdf } = await import(
    "@/components/editor/takumi/render-resume-pdf"
  );
  const bytes = await renderResumePdf({
    preview: resumeToPreview(resume),
    template,
  });

  // pdf.js detaches the buffer it reads, so take the size first.
  const pdfKb = Math.round(bytes.length / 1024);

  onPhase("extract");
  const { extractPdfText } = await import("@/lib/import/extract");
  const extracted = await extractPdfText(bytes);
  if (!extracted.ok) return R.makeError(extracted.reason);

  onPhase("check");
  const text = extracted.text;
  const upper = S.toUpperCase(text);
  let cursor = -1;
  let orderOk = true;
  for (const section of SECTION_ORDER) {
    const index = S.indexOf(upper, section);
    if (O.isNone(index) || index < cursor) {
      orderOk = false;
      break;
    }
    cursor = index;
  }

  const fields = resume.header.fields;
  const name = joinPresent(
    [plainValue(fields.firstName), plainValue(fields.lastName)],
    " ",
  );
  const title = plainValue(fields.jobTitle);
  const email = plainValue(fields.email);

  const lines = pipe(
    text,
    S.split("\n"),
    A.filter((line) => S.isNotEmpty(S.trim(line))),
  );
  const headingIndex = A.getIndexBy(lines, (line) =>
    /^experience$/i.test(S.trim(line)),
  );
  const excerpt = O.match(
    headingIndex,
    (index) => A.slice(lines, index, 3),
    () => [],
  );

  return R.makeOk({
    pdfKb,
    chars: S.length(text),
    excerpt,
    name,
    nameFound: Boolean(name) && S.includes(text, name),
    titleFound: Boolean(title) && S.includes(text, title),
    employerFound: S.includes(text, "Acme Corp"),
    emailFound: Boolean(email) && S.includes(text, email),
    orderOk,
    order: SECTION_ORDER,
  });
}
