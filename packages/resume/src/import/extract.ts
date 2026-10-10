import { A, G, O, pipe, S } from "@mobily/ts-belt";
import { getDocumentProxy } from "unpdf";
import { templateOfCreator } from "../pdf-source";
import type { TemplateId } from "../templates";
import { cleanUrl, type PdfLink } from "./links";

export type ExtractResult =
  | {
      ok: true;
      text: string;
      links: ReadonlyArray<PdfLink>;
      /** The template that made the PDF, when Lanjut made it. */
      source?: TemplateId;
    }
  | { ok: false; reason: "empty" | "encrypted" | "error" };

type PdfDocument = Awaited<ReturnType<typeof getDocumentProxy>>;
type PdfPage = Awaited<ReturnType<PdfDocument["getPage"]>>;

interface PlacedText {
  str: string;
  x: number;
  /** Where the run starts and ends across the page. */
  left: number;
  right: number;
  y: number;
  hasEOL: boolean;
}

/** A line as textLines writes it, with the runs it is made of. */
interface PlacedLine {
  text: string;
  runs: ReadonlyArray<PlacedText>;
}

interface PageRead {
  lines: ReadonlyArray<string>;
  links: ReadonlyArray<PdfLink>;
}

function placedText(item: unknown): PlacedText | undefined {
  if (!G.isObject(item) || !("str" in item) || !("transform" in item)) {
    return undefined;
  }
  const { str, transform } = item as { str: string; transform: number[] };
  const width = Number((item as { width?: number }).width ?? 0);
  return {
    str,
    // The middle of the run's baseline, which lies inside a link's rectangle.
    x: transform[4] + width / 2,
    left: transform[4],
    right: transform[4] + width,
    y: transform[5] + 1,
    hasEOL: Boolean((item as { hasEOL?: boolean }).hasEOL),
  };
}

function lineText(text: string): string {
  return pipe(text, S.replaceByRe(/\s+/g, " "), S.trim);
}

function textLines(items: ReadonlyArray<PlacedText>): ReadonlyArray<string> {
  return pipe(
    A.reduce(
      items,
      "",
      (acc, item) => acc + item.str + (item.hasEOL ? "\n" : ""),
    ),
    S.split("\n"),
    A.map(lineText),
    A.reject(S.isEmpty),
  );
}

interface LineGroups {
  done: ReadonlyArray<ReadonlyArray<PlacedText>>;
  open: ReadonlyArray<PlacedText>;
}

/** The same lines as textLines, each with its runs. */
function placedLines(
  items: ReadonlyArray<PlacedText>,
): ReadonlyArray<PlacedLine> {
  const groups = A.reduce(
    items,
    { done: [], open: [] } as LineGroups,
    (acc, item): LineGroups => {
      const open = A.append(acc.open, item);
      if (!item.hasEOL) return { ...acc, open };
      return { done: A.append(acc.done, open), open: [] };
    },
  );
  return A.filterMap(A.append(groups.done, groups.open), (group) => {
    const text = lineText(
      pipe(
        group,
        A.map((item) => item.str),
        A.join(""),
      ),
    );
    if (S.isEmpty(text)) return O.None;
    return O.Some({ text, runs: group });
  });
}

interface LinkAnnotation {
  subtype?: string;
  url?: string;
  rect?: number[];
}

/**
 * The whole line a link sits on: the line with a run that overlaps the link's
 * rectangle across and down. A run often holds more than the link, such as
 * "Acme Corp, San Francisco, CA" around a link on "Acme Corp", and then the
 * label below misses the link's text, but the line still names its entry. A
 * header sets a column beside another at the same height, so height alone
 * would name the wrong line.
 */
function lineUnder(
  rect: ReadonlyArray<number>,
  lines: ReadonlyArray<PlacedLine>,
): string {
  const [x1 = 0, y1 = 0, x2 = 0, y2 = 0] = rect;
  const [left, right] = [Math.min(x1, x2), Math.max(x1, x2)];
  const [bottom, top] = [Math.min(y1, y2), Math.max(y1, y2)];
  // The rectangle spans a whole line box, so the baseline of the line above
  // can fall inside it too. The link's own line is the lowest one that does.
  // pdf.js starts each line with an empty end-of-line run at the next line's
  // height, so a run with no text places nothing.
  return pipe(
    lines,
    A.filterMap((line) =>
      pipe(
        line.runs,
        A.filter(
          (run) =>
            S.isNotEmpty(S.trim(run.str)) &&
            run.right >= left &&
            run.left <= right &&
            run.y >= bottom &&
            run.y <= top,
        ),
        A.map((run) => run.y),
        A.sort((a, b) => a - b),
        A.head,
        O.map((y) => ({ text: line.text, y })),
      ),
    ),
    A.sort((a, b) => a.y - b.y),
    A.head,
    O.mapWithDefault("", (line) => line.text),
  );
}

/** The text drawn inside a link's rectangle, joined as the page reads it. */
function labelUnder(
  rect: ReadonlyArray<number>,
  items: ReadonlyArray<PlacedText>,
): string {
  const [x1 = 0, y1 = 0, x2 = 0, y2 = 0] = rect;
  const [left, right] = [Math.min(x1, x2), Math.max(x1, x2)];
  const [bottom, top] = [Math.min(y1, y2), Math.max(y1, y2)];
  return pipe(
    items,
    A.filter(
      (item) =>
        item.x >= left && item.x <= right && item.y >= bottom && item.y <= top,
    ),
    A.map((item) => item.str),
    A.join(""),
    S.replaceByRe(/\s+/g, " "),
    S.replaceByRe(/^[\s|•·,;]+|[\s|•·,;]+$/g, ""),
  );
}

function pageLinks(
  annotations: ReadonlyArray<unknown>,
  items: ReadonlyArray<PlacedText>,
): ReadonlyArray<PdfLink> {
  const lines = placedLines(items);
  return A.filterMap(annotations, (raw) => {
    const annotation = raw as LinkAnnotation;
    if (annotation.subtype !== "Link" || !G.isString(annotation.url)) {
      return undefined;
    }
    const url = cleanUrl(annotation.url);
    if (S.isEmpty(url)) return undefined;
    const rect = annotation.rect ?? [];
    return {
      url,
      label: labelUnder(rect, items),
      line: lineUnder(rect, lines),
    };
  });
}

async function readPage(page: PdfPage): Promise<PageRead> {
  const [content, annotations] = await Promise.all([
    page.getTextContent(),
    page.getAnnotations(),
  ]);
  const items = A.filterMap(content.items, placedText);
  return { lines: textLines(items), links: pageLinks(annotations, items) };
}

async function creatorOf(pdf: PdfDocument): Promise<string | undefined> {
  const metadata = await pdf.getMetadata().catch(() => undefined);
  const creator = (metadata?.info as { Creator?: unknown } | undefined)
    ?.Creator;
  return G.isString(creator) ? creator : undefined;
}

async function readDocument(pdf: PdfDocument): Promise<ExtractResult> {
  const [pages, creator] = await Promise.all([
    Promise.all(
      A.makeWithIndex(pdf.numPages, (index) =>
        pdf.getPage(index + 1).then(readPage),
      ),
    ),
    creatorOf(pdf),
  ]);
  const text = pipe(
    pages,
    A.flatMap((page) => page.lines),
    A.join("\n"),
    S.trim,
  );
  if (S.isEmpty(text)) return { ok: false, reason: "empty" };
  return {
    ok: true,
    text,
    links: A.flatMap(pages, (page) => page.links),
    source: templateOfCreator(creator),
  };
}

/**
 * Extract a PDF's text as newline-separated lines, and the links it carries,
 * entirely in-process (unpdf bundles pdf.js; no network, no server). Lines are
 * reconstructed from pdf.js's per-item `hasEOL` flag rather than the flat
 * merged string, so section headings and entries land on their own lines for
 * the parser. Each link keeps the text drawn under it, so a "GitHub" label
 * keeps its address. Distinguishes the failure modes the UI blocks on: no
 * readable text (scanned/image-only) is `empty`, a password-protected file is
 * `encrypted`, anything else is `error`.
 */
export async function extractPdfText(
  bytes: Uint8Array,
): Promise<ExtractResult> {
  try {
    const pdf = await getDocumentProxy(bytes);
    try {
      return await readDocument(pdf);
    } finally {
      await pdf.destroy();
    }
  } catch (error) {
    const message = S.toLowerCase(
      String((error as { message?: unknown })?.message ?? error),
    );
    if (S.includes(message, "password") || S.includes(message, "encrypt")) {
      return { ok: false, reason: "encrypted" };
    }
    return { ok: false, reason: "error" };
  }
}
