import { A, G, pipe, S } from "@mobily/ts-belt";
import { getDocumentProxy } from "unpdf";
import { cleanUrl, type PdfLink } from "./links";

export type ExtractResult =
  | { ok: true; text: string; links: ReadonlyArray<PdfLink> }
  | { ok: false; reason: "empty" | "encrypted" | "error" };

type PdfDocument = Awaited<ReturnType<typeof getDocumentProxy>>;
type PdfPage = Awaited<ReturnType<PdfDocument["getPage"]>>;

interface PlacedText {
  str: string;
  x: number;
  y: number;
  hasEOL: boolean;
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
    y: transform[5] + 1,
    hasEOL: Boolean((item as { hasEOL?: boolean }).hasEOL),
  };
}

function textLines(items: ReadonlyArray<PlacedText>): ReadonlyArray<string> {
  return pipe(
    A.reduce(
      items,
      "",
      (acc, item) => acc + item.str + (item.hasEOL ? "\n" : ""),
    ),
    S.split("\n"),
    A.map(S.replaceByRe(/\s+/g, " ")),
    A.map(S.trim),
    A.reject(S.isEmpty),
  );
}

interface LinkAnnotation {
  subtype?: string;
  url?: string;
  rect?: number[];
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
  return A.filterMap(annotations, (raw) => {
    const annotation = raw as LinkAnnotation;
    if (annotation.subtype !== "Link" || !G.isString(annotation.url)) {
      return undefined;
    }
    const url = cleanUrl(annotation.url);
    if (S.isEmpty(url)) return undefined;
    return { url, label: labelUnder(annotation.rect ?? [], items) };
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

async function readDocument(pdf: PdfDocument): Promise<ExtractResult> {
  const pages = await Promise.all(
    A.makeWithIndex(pdf.numPages, (index) =>
      pdf.getPage(index + 1).then(readPage),
    ),
  );
  const text = pipe(
    pages,
    A.flatMap((page) => page.lines),
    A.join("\n"),
    S.trim,
  );
  if (S.isEmpty(text)) return { ok: false, reason: "empty" };
  return { ok: true, text, links: A.flatMap(pages, (page) => page.links) };
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
