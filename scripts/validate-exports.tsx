/**
 * Parser-validation pass (AGENTS.md export gate). Regenerates the PDF, .docx, and
 * .txt exports from the seed résumé and verifies, via real text extraction, that
 * each output preserves linear reading order and that every field maps through.
 * This is the automated "text-extraction test" (pdftotext-equivalent) that must
 * pass after any change to an export path. Run: `pnpm validate:exports`.
 */
import { inflateSync } from "node:zlib";
import {
  Document,
  Font,
  Page,
  renderToBuffer,
  Text,
  View,
} from "@react-pdf/renderer";
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
  Font.register({
    family: "Merriweather",
    fonts: [
      { src: `${root}/public/fonts/Merriweather-Regular.ttf`, fontWeight: 400 },
      { src: `${root}/public/fonts/Merriweather-Bold.ttf`, fontWeight: 700 },
    ],
  });
  Font.registerHyphenationCallback((word) => [word]);
}

/**
 * fi/fl-heavy probe. fontkit applies GSUB "liga"/"clig" by default, collapsing
 * f+i and f+l into a single ligature glyph whose ToUnicode maps back to two
 * codepoints. Readers that ignore the CMap then drop or garble the pair. The
 * @react-pdf/textkit patch disables those features so each letter stays its own
 * glyph with a single-codepoint ToUnicode, robust for every parser.
 */
const LIGATURE_PROBE = "fintech workflow office final affix fluent classified";

/** ToUnicode destinations that a fi/fl ligature glyph would map back to. */
const LIGATURE_MAPPINGS = [/0066\s*0069/i, /0066\s*006c/i];

/**
 * Fails if any embedded font maps a single glyph to the "fi" or "fl" codepoint
 * pair, i.e. a ligature survived into the PDF. Inflates the FlateDecode streams
 * (which include the ToUnicode CMaps) and scans their bfchar destinations.
 */
async function checkLigatureSafety(family: string): Promise<string[]> {
  const buffer = await renderToBuffer(
    <Document>
      <Page style={{ padding: 40 }}>
        <View>
          <Text style={{ fontFamily: family, fontSize: 12 }}>
            {LIGATURE_PROBE}
          </Text>
        </View>
      </Page>
    </Document>,
  );
  const label = `PDF ligatures (${family})`;
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
    if (inflated.includes("beginbfchar")) cmaps.push(inflated);
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

  for (const family of ["Lora", "Merriweather"]) {
    const ligatureErrors = await checkLigatureSafety(family);
    console.log(
      `PDF ligatures (${family}): ${ligatureErrors.length === 0 ? "fi/fl stay separate glyphs" : "FAILED"}`,
    );
    errors.push(...ligatureErrors);
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
