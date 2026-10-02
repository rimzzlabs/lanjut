import { A, pipe, S } from "@mobily/ts-belt";
import {
  BorderStyle,
  Document,
  ExternalHyperlink,
  ImageRun,
  type IRunOptions,
  Paragraph,
  TabStopType,
  TextRun,
} from "docx";
import type { InlineRun, RichBlock } from "@/lib/resume/rich-content";
import { buildResumeBlocks, type ResumeBlock } from "../resume-blocks";
import { locationSuffix, withLocation } from "../resume-entry-location";
import type {
  ContactView,
  EducationItemView,
  ExperienceItemView,
  HeaderView,
  ResumePreview,
} from "../resume-preview";

const MUTED = "525252";
/** Right page edge in twips for A4 with default 1-inch margins (11906 − 2·1440). */
const RIGHT_TAB = 9026;

function dateRange(start: string, end: string): string {
  if (!start && !end) return "";
  return `${start} - ${end}`;
}

/** Linked runs are underlined; plain runs carry no underline. */
function linkUnderline(href: string | undefined): IRunOptions["underline"] {
  if (!href) return undefined;
  return {};
}

function linkedRun(
  child: TextRun,
  href: string | undefined,
): TextRun | ExternalHyperlink {
  if (!href) return child;
  return new ExternalHyperlink({ link: href, children: [child] });
}

/** A muted run of `prefix + value`, or nothing when `value` is empty. */
function mutedTail(value: string, prefix: string): ReadonlyArray<TextRun> {
  if (!value) return [];
  return [new TextRun({ text: `${prefix}${value}`, color: MUTED })];
}

function inlineRuns(
  runs: ReadonlyArray<InlineRun>,
): ReadonlyArray<TextRun | ExternalHyperlink> {
  return A.map(runs, (run) => {
    const child = new TextRun({
      text: run.text,
      bold: run.bold,
      italics: run.italic,
      underline: linkUnderline(run.href),
    });
    return linkedRun(child, run.href);
  });
}

function richParagraphs(
  blocks: ReadonlyArray<RichBlock>,
): ReadonlyArray<Paragraph> {
  return A.flatMap(blocks, (block): ReadonlyArray<Paragraph> => {
    if (block.type === "paragraph") {
      return [
        new Paragraph({
          children: inlineRuns(block.runs),
          spacing: { after: 80 },
        }),
      ];
    }
    return A.map(
      block.items,
      (item) =>
        new Paragraph({
          children: inlineRuns(item),
          bullet: { level: 0 },
          spacing: { after: 40 },
        }),
    );
  });
}

function sectionHeading(title: string): Paragraph {
  return new Paragraph({
    spacing: { before: 220, after: 100 },
    border: {
      bottom: { style: BorderStyle.SINGLE, size: 4, space: 2, color: "A3A3A3" },
    },
    children: [
      new TextRun({ text: S.toUpperCase(title), bold: true, size: 20 }),
    ],
  });
}

/** A "Title …… Dates" row with the date right-aligned via a tab stop. */
function titleRow(title: string, date: string, href?: string): Paragraph {
  const titleRun = new TextRun({
    text: title,
    bold: true,
    size: 19,
    underline: linkUnderline(href),
  });
  return new Paragraph({
    tabStops: [{ type: TabStopType.RIGHT, position: RIGHT_TAB }],
    children: [linkedRun(titleRun, href), ...mutedTail(date, "\t")],
  });
}

/** A muted subtitle: an optionally linked subject, then a plain-text tail. */
function subtitle(text: string, href?: string, suffix = ""): Paragraph {
  const child = new TextRun({
    text,
    color: MUTED,
    underline: linkUnderline(href),
  });
  return new Paragraph({
    spacing: { after: 40 },
    children: [linkedRun(child, href), ...mutedTail(suffix, "")],
  });
}

function optionalSubtitle(text: string | undefined): ReadonlyArray<Paragraph> {
  if (!text) return [];
  return [subtitle(text)];
}

/**
 * The photo data URL is a pre-cropped square JPEG from the upload path;
 * decode the base64 payload for docx's ImageRun.
 */
function photoRuns(
  photo: string | undefined,
  size: number,
): ReadonlyArray<ImageRun> {
  if (!photo) return [];
  const match = photo.match(/^data:image\/(jpeg|png);base64,(.+)$/);
  if (!match) return [];
  const bytes = Uint8Array.from(atob(match[2]), (char) => char.charCodeAt(0));
  return [
    new ImageRun({
      type: match[1] === "png" ? "png" : "jpg",
      data: bytes,
      transformation: { width: size, height: size },
    }),
  ];
}

function headlineParagraphs(headline: string): ReadonlyArray<Paragraph> {
  if (!headline) return [];
  return [
    new Paragraph({
      spacing: { after: 80 },
      children: [new TextRun({ text: headline, size: 21, color: MUTED })],
    }),
  ];
}

function contactParagraphs(
  contacts: ReadonlyArray<ContactView>,
): ReadonlyArray<Paragraph> {
  if (A.isEmpty(contacts)) return [];
  return [
    new Paragraph({ spacing: { after: 80 }, children: contactRuns(contacts) }),
  ];
}

function headerParagraphs(header: HeaderView): ReadonlyArray<Paragraph> {
  // The photo rides inside the name paragraph: no extra paragraph means the
  // extracted text stays byte-identical with and without a photo.
  return [
    new Paragraph({
      children: [
        ...photoRuns(header.photo, header.photoSize),
        new TextRun({ text: header.fullName, bold: true, size: 36 }),
      ],
    }),
    ...headlineParagraphs(header.headline),
    ...contactParagraphs(header.contacts),
  ];
}

function contactRuns(
  contacts: ReadonlyArray<ContactView>,
): ReadonlyArray<TextRun | ExternalHyperlink> {
  return pipe(
    contacts,
    A.zipWithIndex,
    A.flatMap(
      ([contact, index]): ReadonlyArray<TextRun | ExternalHyperlink> => {
        const child = new TextRun({
          text: contact.value,
          underline: linkUnderline(contact.href),
        });
        const run = linkedRun(child, contact.href);
        if (index === 0) return [run];
        return [new TextRun({ text: "   |   ", color: MUTED }), run];
      },
    ),
  );
}

function gridParagraphs(
  items: ReadonlyArray<{ name: string; proficiency: string }>,
): ReadonlyArray<Paragraph> {
  return A.map(
    items,
    (item) =>
      new Paragraph({
        spacing: { after: 20 },
        children: [
          new TextRun({ text: item.name, bold: true }),
          ...mutedTail(item.proficiency, " - "),
        ],
      }),
  );
}

function companyParagraphs(item: ExperienceItemView): ReadonlyArray<Paragraph> {
  if (!item.company && !item.location) return [];
  return [
    subtitle(
      item.company,
      item.companyHref,
      locationSuffix(item.company, item.location),
    ),
  ];
}

function experienceParagraphs(
  item: ExperienceItemView,
): ReadonlyArray<Paragraph> {
  return [
    titleRow(item.role, dateRange(item.startDate, item.endDate), item.roleHref),
    ...companyParagraphs(item),
    ...optionalSubtitle(item.companyContext),
    ...richParagraphs(item.description),
  ];
}

function educationParagraphs(
  item: EducationItemView,
): ReadonlyArray<Paragraph> {
  return [
    titleRow(item.degree, dateRange(item.startDate, item.endDate)),
    ...optionalSubtitle(withLocation(item.institution, item.location)),
    ...richParagraphs(item.details),
  ];
}

function blockParagraphs(block: ResumeBlock): ReadonlyArray<Paragraph> {
  switch (block.kind) {
    case "header":
      return headerParagraphs(block.header);
    case "heading":
      return [sectionHeading(block.title)];
    case "summary":
      return richParagraphs(block.body);
    case "experience":
      return experienceParagraphs(block.item);
    case "education":
      return educationParagraphs(block.item);
    case "certificate":
      return [
        titleRow(
          block.item.title,
          dateRange(block.item.startDate, block.item.endDate),
        ),
        ...optionalSubtitle(block.item.issuer),
      ];
    case "skills":
    case "languages":
      return gridParagraphs(block.items);
  }
}

/**
 * Builds the résumé as a .docx `Document` in linear reading order, reusing
 * `buildResumeBlocks` so content, ordering, sorting, and empty-section gating
 * match the preview and other exports. No tables or columns are used, so the
 * document stays ATS-parseable; marks (bold/italic/links) and bullets are kept.
 */
export function buildAwalDocx(preview: ResumePreview): Document {
  const children = A.flatMap(buildResumeBlocks(preview), blockParagraphs);

  return new Document({
    styles: {
      default: {
        document: { run: { font: "Calibri", size: 20, color: "0A0A0A" } },
      },
    },
    sections: [
      {
        properties: { page: { size: { width: 11906, height: 16838 } } },
        children,
      },
    ],
  });
}
