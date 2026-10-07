/**
 * Parser-validation pass (AGENTS.md export gate). Regenerates the PDF, .docx, and
 * .txt exports from the seed résumé and verifies, via real text extraction, that
 * each output preserves linear reading order and that every field maps through.
 * The PDF checks live in takumi-checks.ts. This is the automated
 * "text-extraction test" (pdftotext-equivalent) that must pass after any change
 * to an export path. Run: `pnpm validate:exports`.
 */
import { inflateSync } from "node:zlib";
import { Packer } from "docx";
import JSZip from "jszip";
import { extractText, getDocumentProxy } from "unpdf";
import { buildAwalDocx } from "@/components/editor/docx/resume-to-docx";
import { resumeToPreview } from "@/components/editor/resume-to-preview";
import { resumeToText } from "@/components/editor/resume-to-text";
import { SEED_RESUME } from "@/lib/resume/seed";
import { runTakumiChecks } from "./takumi-checks";

/**
 * fi/fl-heavy probe. A shaping engine applies "liga"/"clig" by default,
 * collapsing f+i and f+l into one ligature glyph whose ToUnicode maps back to
 * two codepoints. Readers that ignore the CMap then drop or garble the pair. The
 * PDF stylesheet sets `font-variant-ligatures: none`, so each letter stays its
 * own glyph with a single-codepoint ToUnicode, robust for every parser.
 */
const LIGATURE_PROBE = "fintech workflow office final affix fluent classified";

/** ToUnicode destinations that a fi/fl ligature glyph would map back to. */
const LIGATURE_MAPPINGS = [/0066\s*0069/i, /0066\s*006c/i];

interface LigatureErrorsParams {
  buffer: Uint8Array;
  label: string;
}

/**
 * Fails if any embedded font maps a single glyph to the "fi" or "fl" codepoint
 * pair, i.e. a ligature survived into the PDF. Inflates the FlateDecode streams
 * (which include the ToUnicode CMaps) and scans their bfchar and bfrange destinations.
 */
async function ligatureErrors(params: LigatureErrorsParams): Promise<string[]> {
  const { buffer, label } = params;
  const errors: string[] = [];

  const text = await extractPdfText(buffer);
  for (const word of LIGATURE_PROBE.split(" ")) {
    if (!text.toLowerCase().includes(word)) {
      errors.push(`${label}: "${word}" missing from extracted text`);
    }
  }

  const bytes = Buffer.from(buffer);
  const streams = bytes
    .toString("latin1")
    .matchAll(/stream\r?\n([\s\S]*?)\r?\nendstream/g);
  const cmaps: string[] = [];
  for (const match of streams) {
    let inflated: string;
    try {
      inflated = inflateSync(Buffer.from(match[1], "latin1")).toString(
        "latin1",
      );
    } catch {
      continue;
    }
    if (/begin(bfchar|bfrange)/.test(inflated)) cmaps.push(inflated);
  }
  for (const cmap of cmaps) {
    if (LIGATURE_MAPPINGS.some((pattern) => pattern.test(cmap))) {
      errors.push(
        `${label}: a glyph maps back to an fi/fl pair (ligature not disabled)`,
      );
      break;
    }
  }
  return errors;
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
  "github.com/johndoe",
  "Acme Corp",
  "San Francisco, CA",
  "B2B payments platform serving 2M merchants",
  "Globex",
  "Led migration",
  "State University",
  "Boston, MA",
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

function checkCompanyContextOrder(text: string, label: string): string[] {
  const haystack = text.toUpperCase();
  const fields = [
    "Acme Corp",
    "B2B payments platform serving 2M merchants",
    "Led migration",
  ];
  const positions = fields.map((field) =>
    haystack.indexOf(field.toUpperCase()),
  );
  if (
    positions.some((position) => position === -1) ||
    positions[0] > positions[1] ||
    positions[1] > positions[2]
  ) {
    return [
      `${label}: company context must follow the company and precede achievements`,
    ];
  }
  return [];
}

async function extractPdfText(buffer: Uint8Array): Promise<string> {
  const pdf = await getDocumentProxy(new Uint8Array(buffer));
  const { text } = await extractText(pdf, { mergePages: true });
  return text;
}

async function extractPdfPages(
  buffer: Uint8Array,
): Promise<ReadonlyArray<string>> {
  const pdf = await getDocumentProxy(new Uint8Array(buffer));
  const { text } = await extractText(pdf, { mergePages: false });
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

/** A tiny valid JPEG, enough for the PDF and docx to embed. */
const TEST_PHOTO = `data:image/jpeg;base64,${[
  "/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEB",
  "AQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/2wBDAQEBAQEBAQEBAQEBAQEB",
  "AQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/wAAR",
  "CAACAAIDASIAAhEBAxEB/8QAFAABAAAAAAAAAAAAAAAAAAAACv/EABQQAQAAAAAAAAAAAAAA",
  "AAAAAAD/xAAUAQEAAAAAAAAAAAAAAAAAAAAA/8QAFBEBAAAAAAAAAAAAAAAAAAAAAP/aAAwD",
  "AQACEQMRAD8AfwD/2Q==",
].join("")}`;

async function main(): Promise<void> {
  const preview = resumeToPreview(SEED_RESUME);

  const outputs: [string, string][] = [
    ["TXT", resumeToText(preview)],
    [
      "DOCX",
      await extractDocxText(await Packer.toBuffer(buildAwalDocx(preview))),
    ],
  ];

  const errors: string[] = [];
  for (const [label, text] of outputs) {
    console.log(`${label}: extracted ${text.length} chars`);
    errors.push(
      ...checkReadingOrder(text, label),
      ...checkFields(text, label),
      ...checkCompanyContextOrder(text, label),
    );
  }

  // The opt-in photo is presentation-only: with a photo present, the extracted
  // text of the DOCX (and of every template PDF, in takumi-checks.ts) must be
  // identical to the photo-free output, or the photo has disturbed parsing.
  const photoResume = structuredClone(SEED_RESUME);
  photoResume.header.photo = TEST_PHOTO;
  const photoPreview = resumeToPreview(photoResume);
  const docxPlain = await extractDocxText(
    await Packer.toBuffer(buildAwalDocx(preview)),
  );
  const docxPhoto = await extractDocxText(
    await Packer.toBuffer(buildAwalDocx(photoPreview)),
  );
  if (docxPlain !== docxPhoto) {
    errors.push("DOCX: adding a photo changed the extracted text");
  }
  console.log("Photo invariance: DOCX text identical with a photo");

  const takumiErrors = await runTakumiChecks({
    preview,
    photoPreview,
    ligatureProbe: LIGATURE_PROBE,
    extractPdfText,
    extractPdfPages,
    ligatureErrors,
    textErrors: (text, label) => [
      ...checkReadingOrder(text, label),
      ...checkFields(text, label),
      ...checkCompanyContextOrder(text, label),
    ],
  });
  errors.push(...takumiErrors);

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
