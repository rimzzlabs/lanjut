/**
 * Parser-validation pass (AGENTS.md export gate). Regenerates the PDF, .docx, and
 * .txt exports from the seed résumé and verifies, via real text extraction, that
 * each output preserves linear reading order and that every field maps through.
 * This is the automated "text-extraction test" (pdftotext-equivalent) that must
 * pass after any change to an export path. Run: `pnpm validate:exports`.
 */
import { Font, renderToBuffer } from "@react-pdf/renderer";
import { Packer } from "docx";
import JSZip from "jszip";
import { extractText, getDocumentProxy } from "unpdf";
import { buildAwalDocx } from "@/components/editor/docx/resume-to-docx";
import { TEMPLATE_PDF_DOCUMENTS } from "@/components/editor/pdf/template-pdf-document";
import { resumeToPreview } from "@/components/editor/resume-to-preview";
import { resumeToText } from "@/components/editor/resume-to-text";
import { SEED_RESUME } from "@/lib/resume/seed";

const root = process.cwd();

function registerFonts(): void {
  Font.register({
    family: "Inter",
    fonts: [
      { src: `${root}/public/fonts/Inter-Regular.ttf`, fontWeight: 400 },
      { src: `${root}/public/fonts/Inter-SemiBold.ttf`, fontWeight: 600 },
      { src: `${root}/public/fonts/Inter-Bold.ttf`, fontWeight: 700 },
      {
        src: `${root}/public/fonts/Inter-Italic.ttf`,
        fontWeight: 400,
        fontStyle: "italic",
      },
      {
        src: `${root}/public/fonts/Inter-BoldItalic.ttf`,
        fontWeight: 700,
        fontStyle: "italic",
      },
    ],
  });
  Font.register({
    family: "Lora",
    fonts: [
      { src: `${root}/public/fonts/Lora-Regular.ttf`, fontWeight: 400 },
      { src: `${root}/public/fonts/Lora-Bold.ttf`, fontWeight: 700 },
      {
        src: `${root}/public/fonts/Lora-Italic.ttf`,
        fontWeight: 400,
        fontStyle: "italic",
      },
      {
        src: `${root}/public/fonts/Lora-BoldItalic.ttf`,
        fontWeight: 700,
        fontStyle: "italic",
      },
    ],
  });
  Font.register({
    family: "GeistMono",
    fonts: [
      { src: `${root}/public/fonts/GeistMono-Regular.ttf`, fontWeight: 400 },
      { src: `${root}/public/fonts/GeistMono-Bold.ttf`, fontWeight: 700 },
    ],
  });
  Font.registerHyphenationCallback((word) => [word]);
}

/** Section headings in the order the linear document must present them. */
const SECTION_ORDER = [
  "SUMMARY",
  "EXPERIENCE",
  "EDUCATION",
  "CERTIFICATES",
  "SKILLS",
  "LANGUAGES",
];

/** Fields (from the seed) that every export must carry so a parser can map them. */
const REQUIRED_FIELDS = [
  "John Doe",
  "Senior Frontend Engineer",
  "john.doe@example.com",
  "johndoe.dev",
  "Acme Corp",
  "Globex",
  "Led migration",
  "State University",
  "AWS Certified Solutions Architect",
  "TypeScript",
  "English",
];

function checkReadingOrder(text: string, label: string): string[] {
  const errors: string[] = [];
  const haystack = text.toUpperCase();
  let previous = -1;
  for (const section of SECTION_ORDER) {
    const index = haystack.indexOf(section);
    if (index === -1) {
      errors.push(`${label}: section "${section}" missing`);
    } else if (index < previous) {
      errors.push(`${label}: section "${section}" out of reading order`);
    } else {
      previous = index;
    }
  }
  return errors;
}

/**
 * Case-insensitive: templates may render fields uppercase via textTransform
 * (whole words survive, which is what parsers need). Word-destroying styling
 * (e.g. letterSpacing) still fails because the characters no longer adjoin.
 */
function checkFields(text: string, label: string): string[] {
  const haystack = text.toUpperCase();
  return REQUIRED_FIELDS.filter(
    (field) => !haystack.includes(field.toUpperCase()),
  ).map((field) => `${label}: field "${field}" not found in extracted text`);
}

async function extractPdfText(buffer: Uint8Array): Promise<string> {
  const pdf = await getDocumentProxy(new Uint8Array(buffer));
  const { text } = await extractText(pdf, { mergePages: true });
  return text;
}

async function extractDocxText(buffer: Buffer): Promise<string> {
  const zip = await JSZip.loadAsync(buffer);
  const document = zip.file("word/document.xml");
  if (!document) throw new Error("word/document.xml missing from .docx");
  const xml = await document.async("string");
  return xml
    .replace(/<\/w:p>/g, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

async function main(): Promise<void> {
  registerFonts();
  const preview = resumeToPreview(SEED_RESUME);

  const outputs: [string, string][] = [
    ["TXT", resumeToText(preview)],
    [
      "DOCX",
      await extractDocxText(await Packer.toBuffer(buildAwalDocx(preview))),
    ],
  ];

  // Every template's PDF must extract cleanly, not just the default one.
  for (const [template, PdfDocument] of Object.entries(
    TEMPLATE_PDF_DOCUMENTS,
  )) {
    outputs.push([
      `PDF(${template})`,
      await extractPdfText(
        await renderToBuffer(<PdfDocument preview={preview} />),
      ),
    ]);
  }

  const errors: string[] = [];
  for (const [label, text] of outputs) {
    console.log(`${label}: extracted ${text.length} chars`);
    errors.push(...checkReadingOrder(text, label), ...checkFields(text, label));
  }

  if (errors.length > 0) {
    for (const error of errors) console.error(`  ✗ ${error}`);
    console.error(`\n${errors.length} validation failure(s).`);
    process.exit(1);
  }

  console.log(
    "\n✓ All exports preserve reading order and carry every field (every template PDF, DOCX, TXT).",
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
