import { A, O, pipe, S } from "@mobily/ts-belt";
import { HEADER_SCHEMA, SECTION_REGISTRY } from "..";
import type { InlineRun, RichBlock } from "../rich-content";
import { markdownToRichBlocks } from "./markdown";
import {
  canJoinDates,
  DATES_LABEL,
  DATES_SEPARATOR,
  EMPTY_HEADING,
  type EntryShape,
  entryLabels,
  entryShape,
  type HeadingAttributes,
  isDatesLabel,
  isGridSection,
  type LabelTable,
  readLabelLine,
  readSectionHeading,
  splitName,
  typeOfTitle,
  writeHeadingAttributes,
} from "./resume-md-schema";
import type { InterchangeResume, InterchangeSection } from "./schema";

type Values = Readonly<Record<string, string | undefined>>;

const WORD = /[\p{L}\p{N}]/u;

function isWordAt(text: string, index: number): boolean {
  return O.mapWithDefault(S.get(text, index), false, (char) => WORD.test(char));
}

/**
 * Escapes what the reader gives a meaning to inside a line. An underscore
 * between two letters never opens emphasis, so it stays as it is.
 */
function escapeInline(text: string): string {
  return text.replace(/[\\*[\]_]/g, (char, offset: number) => {
    if (char !== "_") return `\\${char}`;
    const inWord = isWordAt(text, offset - 1) && isWordAt(text, offset + 1);
    return inWord ? "_" : "\\_";
  });
}

const ATX = /^#{1,6}(?:\s|$)/;
const BULLET = /^[-+](?:\s|$)/;
const ORDERED = /^(\d{1,9})[.)](?:\s|$)/;

/** A line that would read as a heading or a list item gets its marker escaped. */
function guardLineStart(line: string): string {
  if (ATX.test(line) || BULLET.test(line)) return `\\${line}`;
  const [, digits] = ORDERED.exec(line) ?? [];
  if (digits === undefined) return line;
  return `${digits}\\${S.sliceToEnd(line, S.length(digits))}`;
}

/** A heading drops a closing run of `#`, so that run is escaped. */
function headingText(text: string): string {
  return escapeInline(text).replace(/(^|\s)(#+)$/, "$1\\$2");
}

function oneLine(value: string): string {
  return pipe(value, S.replaceByRe(/\s*\n\s*/g, " "), S.trim);
}

function fieldValue(values: Values, key: string): string {
  return oneLine(values[key] ?? "");
}

function labelLine(label: string, value: string): string {
  if (S.isEmpty(value)) return `${label}:`;
  return `${label}: ${escapeInline(value)}`;
}

function filledLine(label: string, value: string): ReadonlyArray<string> {
  if (S.isEmpty(value)) return [];
  return [labelLine(label, value)];
}

function linkTarget(href: string): string {
  if (/\s/.test(href)) return `<${href.replace(/[\\<>]/g, "\\$&")}>`;
  return href.replace(/[\\()]/g, "\\$&");
}

function marked(text: string, run: InlineRun): string {
  if (run.bold && run.italic) return `***${text}***`;
  if (run.bold) return `**${text}**`;
  if (run.italic) return `*${text}*`;
  return text;
}

function runText(run: InlineRun): string {
  // Emphasis must hug its text, so the run's edge whitespace goes outside it.
  const [, lead = "", core = "", tail = ""] =
    /^(\s*)([\s\S]*?)(\s*)$/.exec(run.text) ?? [];
  if (S.isEmpty(core)) return run.text;
  const text = marked(escapeInline(core), run);
  if (!run.href) return `${lead}${text}${tail}`;
  return `${lead}[${text}](${linkTarget(run.href)})${tail}`;
}

function inlineText(runs: ReadonlyArray<InlineRun>): string {
  return pipe(runs, A.map(runText), A.join(""), S.trim);
}

function plainText(runs: ReadonlyArray<InlineRun>): string {
  const texts = A.map(runs, (run) => run.text);
  return S.trim(A.join(texts, ""));
}

function sameListKind(a: RichBlock, b: RichBlock): boolean {
  return a.type === "list" && b.type === "list" && a.ordered === b.ordered;
}

interface ListMarkers {
  bullet: string;
  delimiter: string;
}

/**
 * Two lists of one kind in a row read back as one list. A change of marker
 * starts a new list, so every second list in such a row takes the other one.
 */
function listMarkers(
  blocks: ReadonlyArray<RichBlock>,
  index: number,
): ListMarkers {
  const block = A.get(blocks, index);
  const before = pipe(
    A.take(blocks, index),
    A.reverse,
    A.takeWhile((item) =>
      O.mapWithDefault(block, false, (current) => sameListKind(item, current)),
    ),
    A.length,
  );
  if (before % 2 === 1) return { bullet: "+", delimiter: ")" };
  return { bullet: "-", delimiter: "." };
}

function listText(
  block: Extract<RichBlock, { type: "list" }>,
  markers: ListMarkers,
): string {
  const lines = A.mapWithIndex(block.items, (index, runs) => {
    const number = `${index + 1}${markers.delimiter}`;
    const marker = block.ordered ? number : markers.bullet;
    return `${marker} ${guardLineStart(inlineText(runs))}`;
  });
  return A.join(lines, "\n");
}

function richTexts(blocks: ReadonlyArray<RichBlock>): ReadonlyArray<string> {
  return A.mapWithIndex(blocks, (index, block) => {
    if (block.type === "paragraph") {
      return guardLineStart(inlineText(block.runs));
    }
    return listText(block, listMarkers(blocks, index));
  });
}

function richBlocksOf(markdown: string | undefined): ReadonlyArray<RichBlock> {
  return markdownToRichBlocks(markdown ?? "");
}

function dateLines(values: Values, shape: EntryShape): ReadonlyArray<string> {
  const range = {
    startDate: fieldValue(values, "startDate"),
    endDate: fieldValue(values, "endDate"),
  };
  if (canJoinDates(range)) {
    const joined = `${range.startDate}${DATES_SEPARATOR}${range.endDate}`;
    return [labelLine(DATES_LABEL, joined)];
  }
  return pipe(
    shape.plain,
    A.filter((field) => field.key === "startDate" || field.key === "endDate"),
    A.flatMap((field) =>
      filledLine(field.label, fieldValue(values, field.key)),
    ),
  );
}

function labelLines(values: Values, shape: EntryShape): ReadonlyArray<string> {
  return A.flatMap(shape.plain, (field) => {
    if (field.key === "startDate") return dateLines(values, shape);
    if (field.key === "endDate") return [];
    return filledLine(field.label, fieldValue(values, field.key));
  });
}

/** True when the reader would take the body's first paragraph for a label line. */
function startsLikeLabel(
  body: ReadonlyArray<RichBlock>,
  labels: LabelTable,
): boolean {
  const first = A.head(body);
  if (O.isNone(first) || first.type !== "paragraph") return false;
  const line = readLabelLine(plainText(first.runs));
  if (!line) return false;
  return labels.has(line.label) || isDatesLabel(line.label);
}

function headingLines(title: string, shape: EntryShape): ReadonlyArray<string> {
  if (S.isEmpty(title)) return [`### ${EMPTY_HEADING}`];
  const heading = `### ${headingText(title)}`;
  if (title !== EMPTY_HEADING) return [heading];
  // "-" as a real title needs its label, or it reads back as no title.
  return [heading, labelLine(shape.headingLabel, title)];
}

/** An empty label line, so the reader takes it, and not the body, for the labels. */
function guardLines(needed: boolean, shape: EntryShape): ReadonlyArray<string> {
  if (!needed) return [];
  return A.map(A.take(shape.plain, 1), (field) => labelLine(field.label, ""));
}

function bodyBlocks(
  values: Values,
  shape: EntryShape,
): ReadonlyArray<RichBlock> {
  if (!shape.bodyKey) return [];
  return richBlocksOf(values[shape.bodyKey]);
}

interface EntryBlocksParams {
  values: Values;
  shape: EntryShape;
  labels: LabelTable;
}

function entryBlocks(params: EntryBlocksParams): ReadonlyArray<string> {
  const { values, shape, labels } = params;
  const body = bodyBlocks(values, shape);
  const heading = headingLines(fieldValue(values, shape.headingKey), shape);
  const fields = labelLines(values, shape);
  const bare = A.length(heading) === 1 && A.isEmpty(fields);
  const guard = guardLines(bare && startsLikeLabel(body, labels), shape);
  const head = A.join([...heading, ...fields, ...guard], "\n");
  return [head, ...richTexts(body)];
}

function isCompact(name: string): boolean {
  return S.isNotEmpty(name) && !S.includes(name, ": ");
}

function compactLine(name: string, level: string): string {
  const text = S.isEmpty(level) ? name : `${name}: ${level}`;
  return `- ${guardLineStart(escapeInline(text))}`;
}

const NO_LABELS: LabelTable = new Map();

interface GridState {
  blocks: ReadonlyArray<string>;
  list: ReadonlyArray<string>;
}

function closeList(state: GridState): ReadonlyArray<string> {
  if (A.isEmpty(state.list)) return state.blocks;
  return A.append(state.blocks, A.join(state.list, "\n"));
}

/**
 * Skills and languages take one line each. A name that the line cannot hold
 * (it is empty, or it has ": " in it) takes the `###` form of other entries.
 */
function gridBlocks(
  entries: ReadonlyArray<Values>,
  shape: EntryShape,
): ReadonlyArray<string> {
  const start: GridState = { blocks: [], list: [] };
  const end = A.reduce(entries, start, (state, values): GridState => {
    const name = fieldValue(values, shape.headingKey);
    if (isCompact(name)) {
      const line = compactLine(name, fieldValue(values, "level"));
      return { ...state, list: A.append(state.list, line) };
    }
    const entry = entryBlocks({ values, shape, labels: NO_LABELS });
    return { blocks: A.concat(closeList(state), entry), list: [] };
  });
  return closeList(end);
}

function titleOf(section: InterchangeSection): string {
  return section.title || SECTION_REGISTRY[section.type].defaultTitle;
}

function headingAttributes(section: InterchangeSection): HeadingAttributes {
  const title = titleOf(section);
  // Braces at the end of a title that read as attributes need real ones after them.
  const ambiguous = readSectionHeading(title).title !== title;
  if (section.type !== "custom") {
    if (typeOfTitle(title) === section.type && !ambiguous) return {};
    return { type: section.type };
  }
  const named = typeOfTitle(title) !== undefined || ambiguous;
  const emptyList =
    section.variant === "list" && A.isEmpty(section.entries ?? []);
  if (named && emptyList) return { type: "custom", variant: "list" };
  if (named) return { type: "custom" };
  if (emptyList) return { variant: "list" };
  return {};
}

function sectionBlocks(section: InterchangeSection): ReadonlyArray<string> {
  const attributes = writeHeadingAttributes(headingAttributes(section));
  const heading = `## ${headingText(titleOf(section))}${attributes}`;
  if (section.type === "summary") {
    return [heading, ...richTexts(richBlocksOf(section.body))];
  }
  if (section.type === "custom" && section.variant !== "list") {
    return [heading, ...richTexts(richBlocksOf(section.body))];
  }
  const shape = entryShape(section.type);
  const entries: ReadonlyArray<Values> = section.entries ?? [];
  if (isGridSection(section.type)) {
    return [heading, ...gridBlocks(entries, shape)];
  }
  const labels = entryLabels(section.type);
  return [
    heading,
    ...A.flatMap(entries, (values) => entryBlocks({ values, shape, labels })),
  ];
}

function nameLines(header: Values): ReadonlyArray<string> {
  const firstName = fieldValue(header, "firstName");
  const lastName = fieldValue(header, "lastName");
  const name = S.trim(`${firstName} ${lastName}`);
  const split = splitName(name);
  const heading = S.isEmpty(name) ? "" : `# ${headingText(name)}`;
  if (split.firstName === firstName && split.lastName === lastName) {
    return [heading];
  }
  return [
    heading,
    ...A.map(
      A.filter(
        HEADER_SCHEMA,
        (field) => field.key === "firstName" || field.key === "lastName",
      ),
      (field) => labelLine(field.label, fieldValue(header, field.key)),
    ),
  ];
}

function headerBlocks(header: Values): ReadonlyArray<string> {
  const contact = pipe(
    HEADER_SCHEMA,
    A.reject((field) => field.key === "firstName" || field.key === "lastName"),
    A.flatMap((field) =>
      filledLine(field.label, fieldValue(header, field.key)),
    ),
  );
  const lines = A.filter(A.concat(nameLines(header), contact), S.isNotEmpty);
  if (A.isEmpty(lines)) return [];
  return [A.join(lines, "\n")];
}

/** The résumé's header and sections as Markdown. Settings are not part of it. */
export function interchangeToMarkdown(doc: InterchangeResume): string {
  const blocks = A.concat(
    headerBlocks(doc.header ?? {}),
    A.flatMap(doc.sections ?? [], sectionBlocks),
  );
  if (A.isEmpty(blocks)) return "";
  return `${A.join(blocks, "\n\n")}\n`;
}
