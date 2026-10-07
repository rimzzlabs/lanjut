import { inflateSync } from "node:zlib";
import { A, G, O, pipe, S } from "@mobily/ts-belt";
import { getDocumentProxy } from "unpdf";
import type {
  ExperienceItemView,
  ResumePreview,
} from "@/components/editor/resume-preview";
import type { RichBlock } from "@/lib/resume/rich-content";
import { TEMPLATES, type TemplateId } from "@/lib/templates";
import {
  loadTakumiRenderer,
  type TakumiRenderer,
} from "./load-takumi-renderer";

interface TakumiChecksParams {
  preview: ResumePreview;
  photoPreview: ResumePreview;
  ligatureProbe: string;
  extractPdfText: (buffer: Uint8Array) => Promise<string>;
  extractPdfPages: (buffer: Uint8Array) => Promise<ReadonlyArray<string>>;
  ligatureErrors: (params: {
    buffer: Uint8Array;
    label: string;
  }) => Promise<string[]>;
  textErrors: (text: string, label: string) => string[];
}

// The families each template draws with, recorded from the react-pdf exports
// before takumi-pdf replaced them. A stylesheet rule the renderer drops makes a
// template fall back to Inter, which this catches. Luasa also sets its square
// bullets in SquareBullet.
const EXPECTED_FAMILIES: Record<TemplateId, ReadonlyArray<string>> = {
  awal: ["Inter"],
  ketat: ["Inter", "Lora"],
  luasa: ["Inter", "Lora", "SquareBullet"],
  tebal: ["Inter"],
  klasik: ["Lora"],
  ketik: ["GeistMono", "Inter"],
};

// The document letter-spacing setting is bounded to this range so that text
// extraction still recovers word boundaries at its ends.
const LETTER_SPACING_BOUNDS: ReadonlyArray<number> = [-0.5, 0.5];

interface RenderParams {
  takumi: TakumiRenderer;
  preview: ResumePreview;
  template: TemplateId;
}

function render(params: RenderParams): Promise<Uint8Array> {
  const { takumi, preview, template } = params;
  return takumi.render({ preview, template, readFile: takumi.readFontFile });
}

const PROBE_ENTRIES = 10;
const PROBE_FILLER = 6;

/** A list whose first and last bullets name the entry, to find where it starts and ends. */
function probeDescription(index: number): ReadonlyArray<RichBlock> {
  const filler = A.makeWithIndex(PROBE_FILLER, (line) => [
    { text: `Filler line ${line} for entry ${index}, long enough to wrap.` },
  ]);
  return [
    {
      type: "list",
      ordered: false,
      items: pipe(
        [
          [
            {
              text: `START-${index} opens a bullet long enough to wrap onto a second line in every template, at every font size the editor offers, so that the distance between its two lines gives the body line height.`,
            },
          ],
        ],
        A.concat(filler),
        A.append([{ text: `END-${index}` }]),
      ),
    },
  ];
}

/** Enough experience entries to cross several page breaks. */
function splitProbe(preview: ResumePreview): O.Option<ResumePreview> {
  return O.map(A.head(preview.experience), (base: ExperienceItemView) => ({
    ...preview,
    experience: A.makeWithIndex(PROBE_ENTRIES, (index) => ({
      ...base,
      id: `probe-${index}`,
      role: `Probe role ${index}`,
      description: probeDescription(index),
    })),
  }));
}

/** Family names of the fonts a PDF embeds, read from its subset font names. */
function embeddedFamilies(buffer: Uint8Array): ReadonlyArray<string> {
  return pipe(
    Buffer.from(buffer).toString("latin1"),
    S.match(/\/(?:BaseFont|FontName) *\/[A-Z]{6}\+[A-Za-z0-9]+/g),
    O.getWithDefault<ReadonlyArray<O.Option<string>>>([]),
    A.filter(G.isString),
    A.map((name) => S.replaceByRe(name, /^.*\+/, "")),
    A.uniq,
    A.sort((a, b) => a.localeCompare(b)),
  );
}

/**
 * Text drawn with a stroke render mode (`1 Tr` or `2 Tr`). takumi-pdf fakes a
 * weight above the heaviest face this way, which a browser never does.
 */
function strokedTextRuns(buffer: Uint8Array): number {
  const raw = Buffer.from(buffer).toString("latin1");
  return pipe(
    Array.from(raw.matchAll(/stream\r?\n([\s\S]*?)endstream/g)),
    A.map((match) => {
      try {
        return inflateSync(Buffer.from(match[1], "latin1")).toString("latin1");
      } catch {
        return "";
      }
    }),
    A.map((content) =>
      A.length(Array.from(content.matchAll(/(^|\s)[12] Tr\b/g))),
    ),
    A.reduce(0, (total, count) => total + count),
  );
}

/**
 * Graphics states that fill at zero opacity. Text drawn in one is hidden from
 * the reader but not from a parser, and ATS checkers flag it.
 */
function hiddenFillStates(buffer: Uint8Array): number {
  return pipe(
    Buffer.from(buffer).toString("latin1"),
    S.match(/\/ca\s+0(?![.\d])/g),
    O.mapWithDefault(0, A.length),
  );
}

interface PlacedText {
  text: string;
  x: number;
  y: number;
}

async function pageItems(
  buffer: Uint8Array,
): Promise<ReadonlyArray<PlacedText>> {
  const pdf = await getDocumentProxy(new Uint8Array(buffer));
  const content = await (await pdf.getPage(1)).getTextContent();
  return pipe(
    content.items,
    A.filter((item) => "str" in item && S.isNotEmpty(S.trim(item.str))),
    A.map((item) => {
      const placed = item as { str: string; transform: number[] };
      return {
        text: placed.str,
        x: O.getWithDefault(A.get(placed.transform, 4), 0),
        y: O.getWithDefault(A.get(placed.transform, 5), 0),
      };
    }),
  );
}

// Résumé parsers read bullets in content order and split entries at a line gap
// well above the body line height (OpenResume uses 1.4 times it).
const ENTRY_GAP_LIMIT = 1.4;

/**
 * Checks, in content order, that each "•" comes before its item's text, and
 * that the probe's first bullet sits close enough to the line above it to stay
 * in the same entry.
 */
function bulletErrors(params: {
  items: ReadonlyArray<PlacedText>;
  label: string;
}): ReadonlyArray<string> {
  const { items, label } = params;
  const misplaced = pipe(
    items,
    A.filterWithIndex((index, item) => {
      if (item.text !== "•") return false;
      return O.mapWithDefault(
        A.get(items, index + 1),
        true,
        (next) => Math.abs(next.y - item.y) > 0.5 || next.x <= item.x,
      );
    }),
    A.length,
  );
  const markerErrors = failWhen(
    misplaced > 0,
    `${label}: ${misplaced} bullet markers do not precede their text`,
  );
  const start = A.getIndexBy(items, (item) =>
    S.startsWith(item.text, "START-0"),
  );
  if (O.isNone(start))
    return A.append(markerErrors, `${label}: no START-0 bullet`);
  const leading = O.mapWithDefault(
    A.get(items, start - 1),
    false,
    (item) => item.text === "•",
  );
  if (!leading) {
    return A.append(
      markerErrors,
      `${label}: no "•" before the first bullet's text`,
    );
  }
  const above = A.get(items, start - 2);
  const bullet = A.get(items, start);
  const wrapped = pipe(
    items,
    A.sliceToEnd(start + 1),
    A.find((item) =>
      O.mapWithDefault(bullet, false, (first) => item.y < first.y - 0.5),
    ),
  );
  if (
    O.isNone(above) ||
    O.isNone(bullet) ||
    O.isNone(wrapped) ||
    wrapped.text === "•"
  ) {
    return A.append(markerErrors, `${label}: could not place the first bullet`);
  }
  const lineHeight = bullet.y - wrapped.y;
  const gap = above.y - bullet.y;
  return pipe(
    markerErrors,
    A.concat(
      failWhen(
        gap > lineHeight * ENTRY_GAP_LIMIT,
        `${label}: the first bullet sits ${gap.toFixed(1)}pt below its entry, over ${ENTRY_GAP_LIMIT} line heights (${lineHeight.toFixed(1)}pt)`,
      ),
    ),
  );
}

function failWhen(failed: boolean, message: string): ReadonlyArray<string> {
  if (!failed) return [];
  return [message];
}

const HEADING_PROBE = "HEADPROBE";
// One-line summary paragraphs, stepped so the heading after them crosses the
// page foot at some step in every template.
const ORPHAN_STEPS = A.makeWithIndex(17, (step) => 16 + step * 3);

/** A summary of `lines` paragraphs, then one experience entry under a marked heading. */
function orphanProbe(params: {
  preview: ResumePreview;
  entry: ExperienceItemView;
  lines: number;
}): ResumePreview {
  const { preview, entry, lines } = params;
  return {
    ...preview,
    headings: { ...preview.headings, experience: HEADING_PROBE },
    sectionOrder: [{ type: "experience", id: "experience" }],
    summary: A.makeWithIndex(lines, (line) => ({
      type: "paragraph",
      runs: [{ text: `Summary line ${line}.` }],
    })),
    experience: [{ ...entry, description: probeDescription(0) }],
  };
}

function pageOf(pages: ReadonlyArray<string>, marker: string): number {
  return O.getWithDefault(
    A.getIndexBy(pages, (page) => S.includes(page, marker)),
    -1,
  );
}

interface TemplateCheckParams {
  takumi: TakumiRenderer;
  template: TemplateId;
  checks: TakumiChecksParams;
}

async function checkTemplate(
  params: TemplateCheckParams,
): Promise<ReadonlyArray<string>> {
  const { takumi, template, checks } = params;
  const label = `TAKUMI(${template})`;
  const buffer = await render({ takumi, preview: checks.preview, template });
  const text = await checks.extractPdfText(buffer);
  console.log(`${label}: extracted ${S.length(text)} chars`);
  const families = A.join(embeddedFamilies(buffer), ", ");
  const expected = A.join(EXPECTED_FAMILIES[template], ", ");
  const fontErrors = failWhen(
    families !== expected,
    `${label}: embeds ${families}, expected ${expected}`,
  );

  const strokeErrors = failWhen(
    strokedTextRuns(buffer) > 0,
    `${label}: text is stroked to fake a heavier weight`,
  );

  const hiddenErrors = failWhen(
    hiddenFillStates(buffer) > 0,
    `${label}: draws with a zero-opacity fill, which hides text`,
  );

  const spacingErrors = await Promise.all(
    A.map(LETTER_SPACING_BOUNDS, async (letterSpacing) => {
      const spaced = await checks.extractPdfText(
        await render({
          takumi,
          preview: { ...checks.preview, letterSpacing },
          template,
        }),
      );
      return checks.textErrors(spaced, `${label} spacing ${letterSpacing}`);
    }),
  );

  const withPhoto = await checks.extractPdfText(
    await render({ takumi, preview: checks.photoPreview, template }),
  );
  const photoErrors = failWhen(
    text !== withPhoto,
    `${label}: adding a photo changed the text`,
  );

  const probe = splitProbe(checks.preview);
  if (O.isNone(probe)) return [`${label}: seed has no experience entry`];
  const probeBuffer = await render({ takumi, preview: probe, template });
  const pages = await checks.extractPdfPages(probeBuffer);
  const listErrors = bulletErrors({
    items: await pageItems(probeBuffer),
    label,
  });
  const splitErrors = pipe(
    A.range(0, PROBE_ENTRIES - 1),
    A.filter(
      (index) =>
        pageOf(pages, `START-${index}`) !== pageOf(pages, `END-${index}`),
    ),
    A.map((index) => `${label}: entry ${index} split across a page break`),
  );
  if (A.length(pages) < 2) {
    return [`${label}: split probe fit on one page, so it tested nothing`];
  }

  return pipe(
    checks.textErrors(text, label),
    A.concat(fontErrors),
    A.concat(strokeErrors),
    A.concat(hiddenErrors),
    A.concat(A.flat(spacingErrors)),
    A.concat(photoErrors),
    A.concat(splitErrors),
    A.concat(listErrors),
  );
}

/**
 * Sweeps the heading down the page until it reaches the page foot, and fails
 * when it ever lands on another page than its first entry.
 */
async function checkHeadingOrphans(
  params: TemplateCheckParams,
): Promise<ReadonlyArray<string>> {
  const { takumi, template, checks } = params;
  const label = `TAKUMI(${template})`;
  const entry = A.head(checks.preview.experience);
  if (O.isNone(entry)) return [`${label}: seed has no experience entry`];
  const placements = await Promise.all(
    A.map(ORPHAN_STEPS, async (lines) => {
      const pages = await checks.extractPdfPages(
        await render({
          takumi,
          preview: orphanProbe({ preview: checks.preview, entry, lines }),
          template,
        }),
      );
      return {
        lines,
        heading: pageOf(pages, HEADING_PROBE),
        entry: pageOf(pages, "START-0"),
      };
    }),
  );
  const crossed = A.some(placements, (placement) => placement.heading > 0);
  const orphanErrors = pipe(
    placements,
    A.filter((placement) => placement.heading !== placement.entry),
    A.map(
      (placement) =>
        `${label}: heading left at a page foot after ${placement.lines} summary lines`,
    ),
  );
  return pipe(
    failWhen(!crossed, `${label}: heading probe never crossed a page break`),
    A.concat(orphanErrors),
  );
}

interface LigatureCheckParams {
  takumi: TakumiRenderer;
  fontId: string;
  checks: TakumiChecksParams;
}

async function checkLigatures(params: LigatureCheckParams): Promise<string[]> {
  const { takumi, fontId, checks } = params;
  const preview: ResumePreview = {
    ...checks.preview,
    font: fontId,
    summary: [{ type: "paragraph", runs: [{ text: checks.ligatureProbe }] }],
  };
  const buffer = await render({ takumi, preview, template: "awal" });
  const errors = await checks.ligatureErrors({
    buffer,
    label: `TAKUMI ligatures (${fontId})`,
  });
  console.log(
    `TAKUMI ligatures (${fontId}): ${A.isEmpty(errors) ? "fi/fl stay separate glyphs" : "FAILED"}`,
  );
  return errors;
}

/**
 * Runs the PDF export checks for every template: reading order and fields, at
 * both letter-spacing bounds too, font families, no faked weights, photo
 * invariance, no entry split across a page, no heading left at a page foot,
 * and no fi/fl ligatures.
 */
export async function runTakumiChecks(
  checks: TakumiChecksParams,
): Promise<ReadonlyArray<string>> {
  const takumi = await loadTakumiRenderer();
  try {
    const templateErrors = await Promise.all(
      A.map(TEMPLATES, (summary) =>
        checkTemplate({ takumi, template: summary.id, checks }),
      ),
    );
    const orphanErrors = await Promise.all(
      A.map(TEMPLATES, (summary) =>
        checkHeadingOrphans({ takumi, template: summary.id, checks }),
      ),
    );
    const ligatureErrors = await Promise.all(
      A.map(["lora", "merriweather"], (fontId) =>
        checkLigatures({ takumi, fontId, checks }),
      ),
    );
    return pipe(
      A.flat(templateErrors),
      A.concat(A.flat(orphanErrors)),
      A.concat(A.flat(ligatureErrors)),
    );
  } finally {
    await takumi.close();
  }
}
