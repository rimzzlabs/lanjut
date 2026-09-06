import { resumeToPreview } from "@/components/editor/resume-to-preview";
import type { Resume } from "@/lib/resume";
import type { TemplateId } from "@/lib/templates";

export type ParserPhase = "render" | "extract" | "check";

export interface ParserProofReport {
  pdfKb: number;
  chars: number;
  excerpt: string[];
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

/**
 * The landing page's proof run: renders the given document to a real PDF with
 * the real export pipeline, extracts its text with the same parser the import
 * feature uses, and checks what an ATS would check. Everything happens in the
 * visitor's browser; every heavy module loads lazily on first run.
 */
export async function runParserProof(
  resume: Resume,
  template: TemplateId,
  onPhase: (phase: ParserPhase) => void,
): Promise<ParserProofReport> {
  onPhase("render");
  const [{ pdf }, { registerPdfFonts }, { TEMPLATE_PDF_DOCUMENTS }] =
    await Promise.all([
      import("@react-pdf/renderer"),
      import("@/components/editor/pdf/pdf-fonts"),
      import("@/components/editor/pdf/template-pdf-document"),
    ]);
  registerPdfFonts();
  const preview = resumeToPreview(resume);
  const PdfDocument = TEMPLATE_PDF_DOCUMENTS[template];
  const blob = await pdf(<PdfDocument preview={preview} />).toBlob();

  onPhase("extract");
  const { extractPdfText } = await import("@/lib/import/extract");
  const bytes = new Uint8Array(await blob.arrayBuffer());
  const extracted = await extractPdfText(bytes);
  if (!extracted.ok) throw new Error(extracted.reason);

  onPhase("check");
  const text = extracted.text;
  const upper = text.toUpperCase();
  let cursor = -1;
  let orderOk = true;
  for (const section of SECTION_ORDER) {
    const index = upper.indexOf(section);
    if (index === -1 || index < cursor) {
      orderOk = false;
      break;
    }
    cursor = index;
  }

  const fields = resume.header.fields;
  const name = [plainValue(fields.firstName), plainValue(fields.lastName)]
    .filter(Boolean)
    .join(" ");
  const title = plainValue(fields.jobTitle);
  const email = plainValue(fields.email);

  const lines = text.split("\n").filter((line) => line.trim());
  const headingIndex = lines.findIndex((line) =>
    /^experience$/i.test(line.trim()),
  );
  const excerpt =
    headingIndex === -1 ? [] : lines.slice(headingIndex, headingIndex + 3);

  return {
    pdfKb: Math.round(blob.size / 1024),
    chars: text.length,
    excerpt,
    name,
    nameFound: Boolean(name) && text.includes(name),
    titleFound: Boolean(title) && text.includes(title),
    employerFound: text.includes("Acme Corp"),
    emailFound: Boolean(email) && text.includes(email),
    orderOk,
    order: SECTION_ORDER,
  };
}
