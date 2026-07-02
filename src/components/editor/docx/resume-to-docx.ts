import {
  BorderStyle,
  Document,
  ExternalHyperlink,
  Paragraph,
  TabStopType,
  TextRun,
} from "docx";
import { buildResumeBlocks } from "../resume-blocks";
import type { ContactView, HeaderView, ResumePreview } from "../resume-preview";
import type { InlineRun, RichBlock } from "../rich-content";

const MUTED = "525252";
/** Right page edge in twips for A4 with default 1-inch margins (11906 − 2·1440). */
const RIGHT_TAB = 9026;

function dateRange(start: string, end: string): string {
  if (!start && !end) return "";
  return `${start} - ${end}`;
}

function inlineRuns(runs: InlineRun[]): (TextRun | ExternalHyperlink)[] {
  return runs.map((run) => {
    const child = new TextRun({
      text: run.text,
      bold: run.bold,
      italics: run.italic,
    });
    return run.href
      ? new ExternalHyperlink({ link: run.href, children: [child] })
      : child;
  });
}

function richParagraphs(blocks: RichBlock[]): Paragraph[] {
  const paragraphs: Paragraph[] = [];
  for (const block of blocks) {
    if (block.type === "paragraph") {
      paragraphs.push(
        new Paragraph({
          children: inlineRuns(block.runs),
          spacing: { after: 80 },
        }),
      );
      continue;
    }
    for (const item of block.items) {
      paragraphs.push(
        new Paragraph({
          children: inlineRuns(item),
          bullet: { level: 0 },
          spacing: { after: 40 },
        }),
      );
    }
  }
  return paragraphs;
}

function sectionHeading(title: string): Paragraph {
  return new Paragraph({
    spacing: { before: 220, after: 100 },
    border: {
      bottom: { style: BorderStyle.SINGLE, size: 4, space: 2, color: "A3A3A3" },
    },
    children: [
      new TextRun({ text: title.toUpperCase(), bold: true, size: 20 }),
    ],
  });
}

/** A "Title …… Dates" row with the date right-aligned via a tab stop. */
function titleRow(title: string, date: string): Paragraph {
  return new Paragraph({
    tabStops: [{ type: TabStopType.RIGHT, position: RIGHT_TAB }],
    children: [
      new TextRun({ text: title, bold: true, size: 19 }),
      ...(date ? [new TextRun({ text: `\t${date}`, color: MUTED })] : []),
    ],
  });
}

function subtitle(text: string, href?: string): Paragraph {
  const child = new TextRun({ text, color: MUTED });
  return new Paragraph({
    spacing: { after: 40 },
    children: [
      href ? new ExternalHyperlink({ link: href, children: [child] }) : child,
    ],
  });
}

function headerParagraphs(header: HeaderView): Paragraph[] {
  const paragraphs: Paragraph[] = [
    new Paragraph({
      children: [new TextRun({ text: header.fullName, bold: true, size: 36 })],
    }),
  ];
  if (header.headline) {
    paragraphs.push(
      new Paragraph({
        spacing: { after: 80 },
        children: [
          new TextRun({ text: header.headline, size: 21, color: MUTED }),
        ],
      }),
    );
  }
  if (header.contacts.length > 0) {
    paragraphs.push(
      new Paragraph({
        spacing: { after: 80 },
        children: contactRuns(header.contacts),
      }),
    );
  }
  return paragraphs;
}

function contactRuns(contacts: ContactView[]): (TextRun | ExternalHyperlink)[] {
  const runs: (TextRun | ExternalHyperlink)[] = [];
  contacts.forEach((contact, index) => {
    if (index > 0) runs.push(new TextRun({ text: "   |   ", color: MUTED }));
    const child = new TextRun({ text: contact.value });
    runs.push(
      contact.href
        ? new ExternalHyperlink({ link: contact.href, children: [child] })
        : child,
    );
  });
  return runs;
}

function gridParagraphs(
  items: { name: string; proficiency: string }[],
): Paragraph[] {
  return items.map(
    (item) =>
      new Paragraph({
        spacing: { after: 20 },
        children: [
          new TextRun({ text: item.name, bold: true }),
          ...(item.proficiency
            ? [new TextRun({ text: ` — ${item.proficiency}`, color: MUTED })]
            : []),
        ],
      }),
  );
}

/**
 * Builds the résumé as a .docx `Document` in linear reading order, reusing
 * `buildResumeBlocks` so content, ordering, sorting, and empty-section gating
 * match the preview and other exports. No tables or columns are used, so the
 * document stays ATS-parseable; marks (bold/italic/links) and bullets are kept.
 */
export function buildAwalDocx(preview: ResumePreview): Document {
  const children: Paragraph[] = [];

  for (const block of buildResumeBlocks(preview)) {
    switch (block.kind) {
      case "header":
        children.push(...headerParagraphs(block.header));
        break;
      case "heading":
        children.push(sectionHeading(block.title));
        break;
      case "summary":
        children.push(...richParagraphs(block.body));
        break;
      case "experience": {
        const item = block.item;
        children.push(
          titleRow(item.role, dateRange(item.startDate, item.endDate)),
        );
        if (item.company)
          children.push(subtitle(item.company, item.companyHref));
        children.push(...richParagraphs(item.description));
        break;
      }
      case "education": {
        const item = block.item;
        children.push(
          titleRow(item.degree, dateRange(item.startDate, item.endDate)),
        );
        if (item.institution) children.push(subtitle(item.institution));
        children.push(...richParagraphs(item.details));
        break;
      }
      case "certificate": {
        const item = block.item;
        children.push(
          titleRow(item.title, dateRange(item.startDate, item.endDate)),
        );
        if (item.issuer) children.push(subtitle(item.issuer));
        break;
      }
      case "skills":
      case "languages":
        children.push(...gridParagraphs(block.items));
        break;
    }
  }

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
