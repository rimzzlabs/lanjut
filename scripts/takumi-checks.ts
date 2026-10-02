import { A, O, pipe, S } from "@mobily/ts-belt";
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
        [[{ text: `START-${index}` }]],
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
  const text = await checks.extractPdfText(
    await render({ takumi, preview: checks.preview, template }),
  );
  console.log(`${label}: extracted ${S.length(text)} chars`);
  const withPhoto = await checks.extractPdfText(
    await render({ takumi, preview: checks.photoPreview, template }),
  );
  const photoErrors =
    text === withPhoto ? [] : [`${label}: adding a photo changed the text`];

  const probe = splitProbe(checks.preview);
  if (O.isNone(probe)) return [`${label}: seed has no experience entry`];
  const pages = await checks.extractPdfPages(
    await render({ takumi, preview: probe, template }),
  );
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
    A.concat(photoErrors),
    A.concat(splitErrors),
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
 * Runs the export checks against the Takumi PDF path for every template:
 * reading order and fields, photo invariance, no entry split across a page,
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
    const ligatureErrors = await Promise.all(
      A.map(["lora", "merriweather"], (fontId) =>
        checkLigatures({ takumi, fontId, checks }),
      ),
    );
    return pipe(A.flat(templateErrors), A.concat(A.flat(ligatureErrors)));
  } finally {
    await takumi.close();
  }
}
