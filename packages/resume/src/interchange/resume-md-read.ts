import { A, O, pipe, S } from "@mobily/ts-belt";
import type { ElementNode, Node as MdNode } from "comark";
import type { CustomVariant, SectionType } from "..";
import {
  countBlocks,
  hasTag,
  headingOf,
  LIST_TAGS,
  linesOf,
  listItems,
  type Nodes,
  parseMarkdown,
  plainOf,
  richText,
  textOf,
} from "./resume-md-nodes";
import {
  EMPTY_HEADING,
  type EntrySectionType,
  entryLabels,
  entryShape,
  HEADER_LABELS,
  isDatesLabel,
  isGridSection,
  type LabelLine,
  type LabelTable,
  readLabelLine,
  readSectionHeading,
  type SectionHeading,
  splitDates,
  splitName,
  typeOfTitle,
} from "./resume-md-schema";
import type { InterchangeResume, InterchangeSection } from "./schema";

type Fields = Readonly<Record<string, string>>;

type Resolve = (line: LabelLine) => Fields | undefined;

function resolver(labels: LabelTable, hasDates: boolean): Resolve {
  return (line) => {
    if (hasDates && isDatesLabel(line.label)) {
      return { ...splitDates(line.value) };
    }
    const key = labels.get(line.label);
    if (key === undefined) return undefined;
    return { [key]: line.value };
  };
}

interface LabelBlock {
  fields: Fields;
  /** The lines that are not labels, as one paragraph, or nothing. */
  rest: Nodes;
}

function restParagraph(lines: ReadonlyArray<Nodes>): Nodes {
  const inline = pipe(
    lines,
    A.filter((line) => S.isNotEmpty(S.trim(textOf(line)))),
    A.flatMap((line): Nodes => [...line, " "]),
  );
  if (A.isEmpty(inline)) return [];
  return [["p", {}, ...inline]];
}

/**
 * Reads the paragraph under a heading line by line. A line with a label of
 * this section is a field. Any other line stays as text, so nothing is lost.
 */
function readLabelBlock(paragraph: ElementNode, resolve: Resolve): LabelBlock {
  const start: { fields: Fields; rest: ReadonlyArray<Nodes> } = {
    fields: {},
    rest: [],
  };
  const read = A.reduce(linesOf(paragraph), start, (state, line) => {
    const label = readLabelLine(textOf(line));
    const fields = label && resolve(label);
    if (!fields) return { ...state, rest: A.append(state.rest, line) };
    return { ...state, fields: { ...state.fields, ...fields } };
  });
  return { fields: read.fields, rest: restParagraph(read.rest) };
}

interface Group {
  heading: ElementNode;
  nodes: Nodes;
}

interface Split {
  before: Nodes;
  groups: ReadonlyArray<Group>;
}

function splitAtTag(nodes: Nodes, tag: string): Split {
  const start: Split = { before: [], groups: [] };
  return A.reduce(nodes, start, (split, node) => {
    if (hasTag(node, [tag])) {
      const group = { heading: node, nodes: [] };
      return { ...split, groups: A.append(split.groups, group) };
    }
    const last = A.last(split.groups);
    if (O.isNone(last)) {
      return { ...split, before: A.append(split.before, node) };
    }
    const grown = { ...last, nodes: A.append(last.nodes, node) };
    return { ...split, groups: A.append(A.initOrEmpty(split.groups), grown) };
  });
}

interface Counted<T> {
  value: T;
  /** Blocks of text with no field in their section. They are left out. */
  ignored: number;
}

function titleField(title: string): string {
  if (title === EMPTY_HEADING) return "";
  return title;
}

const NO_LABELS: LabelBlock = { fields: {}, rest: [] };

interface EntryParts {
  labels: LabelBlock;
  body: Nodes;
}

/** The labels are the first paragraph under the heading, when one is there. */
function entryParts(nodes: Nodes, resolve: Resolve): EntryParts {
  const first = A.head(nodes);
  if (O.isNone(first) || !hasTag(first, ["p"])) {
    return { labels: NO_LABELS, body: nodes };
  }
  const labels = readLabelBlock(first, resolve);
  return { labels, body: A.concat(labels.rest, A.tailOrEmpty(nodes)) };
}

function readEntry(group: Group, type: EntrySectionType): Counted<Fields> {
  const shape = entryShape(type);
  const resolve = resolver(entryLabels(type), shape.hasDates);
  const { labels, body } = entryParts(group.nodes, resolve);
  const fields: Fields = {
    [shape.headingKey]: titleField(headingOf(group.heading)),
    ...labels.fields,
  };
  if (!shape.bodyKey) return { value: fields, ignored: countBlocks(body) };
  return {
    value: { ...fields, [shape.bodyKey]: richText(body) },
    ignored: 0,
  };
}

/** Text before the first `###` becomes an entry with no title, when the section has a body. */
function strayEntries(
  nodes: Nodes,
  type: EntrySectionType,
): Counted<ReadonlyArray<Fields>> {
  const shape = entryShape(type);
  const text = richText(nodes);
  if (S.isEmpty(text)) return { value: [], ignored: 0 };
  if (!shape.bodyKey) return { value: [], ignored: countBlocks(nodes) };
  return { value: [{ [shape.bodyKey]: text }], ignored: 0 };
}

function readEntries(
  nodes: Nodes,
  type: EntrySectionType,
): Counted<ReadonlyArray<Fields>> {
  const split = splitAtTag(nodes, "h3");
  const stray = strayEntries(split.before, type);
  const entries = A.map(split.groups, (group) => readEntry(group, type));
  return {
    value: A.concat(
      stray.value,
      A.map(entries, (entry) => entry.value),
    ),
    ignored: A.reduce(
      entries,
      stray.ignored,
      (sum, entry) => sum + entry.ignored,
    ),
  };
}

/** `TypeScript: Advanced` as a name and a level. With no ": ", it is a name. */
function compactEntry(text: string): Fields {
  return O.mapWithDefault<number, Fields>(
    S.indexOf(text, ": "),
    { name: text },
    (at) => ({
      name: S.trim(S.slice(text, 0, at)),
      level: S.trim(S.sliceToEnd(text, at + 2)),
    }),
  );
}

interface GridState {
  entries: ReadonlyArray<Fields>;
  ignored: number;
  /** The last entry is a `###`, so the next paragraph holds its labels. */
  open: boolean;
}

function readGridNode(
  state: GridState,
  node: MdNode,
  resolve: Resolve,
): GridState {
  if (hasTag(node, LIST_TAGS)) {
    const items = A.map(listItems(node), (runs) => compactEntry(plainOf(runs)));
    return { ...state, entries: A.concat(state.entries, items), open: false };
  }
  if (hasTag(node, ["h3"])) {
    const entry = { name: titleField(headingOf(node)) };
    return { ...state, entries: A.append(state.entries, entry), open: true };
  }
  if (hasTag(node, ["p"]) && state.open) {
    const block = readLabelBlock(node, resolve);
    const last = O.getWithDefault(A.last(state.entries), {});
    return {
      entries: A.append(A.initOrEmpty(state.entries), {
        ...last,
        ...block.fields,
      }),
      ignored: state.ignored + countBlocks(block.rest),
      open: false,
    };
  }
  if (hasTag(node, ["p"])) {
    const names = pipe(
      linesOf(node),
      A.map((line) => S.trim(textOf(line))),
      A.filter(S.isNotEmpty),
      A.map(compactEntry),
    );
    return { ...state, entries: A.concat(state.entries, names) };
  }
  return {
    ...state,
    ignored: state.ignored + countBlocks([node]),
    open: false,
  };
}

function readGrid(
  nodes: Nodes,
  type: "skills" | "languages",
): Counted<ReadonlyArray<Fields>> {
  const resolve = resolver(entryLabels(type), false);
  const start: GridState = { entries: [], ignored: 0, open: false };
  const end = A.reduce(nodes, start, (state, node) =>
    readGridNode(state, node, resolve),
  );
  return { value: end.entries, ignored: end.ignored };
}

interface MdSection {
  type: SectionType;
  variant?: CustomVariant;
  title: string;
  body?: string;
  entries?: ReadonlyArray<Fields>;
}

function readCustom(group: Group, heading: SectionHeading): Counted<MdSection> {
  const hasEntries = A.some(group.nodes, (node) => hasTag(node, ["h3"]));
  const inferred = hasEntries ? "list" : "rich";
  const variant = heading.variant ?? inferred;
  const section: MdSection = { type: "custom", variant, title: heading.title };
  if (variant === "rich") {
    return { value: { ...section, body: richText(group.nodes) }, ignored: 0 };
  }
  const read = readEntries(group.nodes, "custom");
  return { value: { ...section, entries: read.value }, ignored: read.ignored };
}

function readSectionEntries(
  nodes: Nodes,
  type: EntrySectionType,
): Counted<ReadonlyArray<Fields>> {
  if (isGridSection(type)) return readGrid(nodes, type);
  return readEntries(nodes, type);
}

function readSection(group: Group): Counted<MdSection> {
  const heading = readSectionHeading(headingOf(group.heading));
  const type = heading.type ?? typeOfTitle(heading.title) ?? "custom";
  const section: MdSection = { type, title: heading.title };
  if (type === "custom") return readCustom(group, heading);
  if (type === "summary") {
    return { value: { ...section, body: richText(group.nodes) }, ignored: 0 };
  }
  const read = readSectionEntries(group.nodes, type);
  return { value: { ...section, entries: read.value }, ignored: read.ignored };
}

interface HeaderState {
  name: string | undefined;
  block: LabelBlock | undefined;
  stray: Nodes;
}

interface HeaderRead {
  header: Fields;
  /** Text above the first section that is not the name or a label. */
  stray: Nodes;
}

function readHeader(nodes: Nodes): HeaderRead {
  const resolve = resolver(HEADER_LABELS, false);
  const start: HeaderState = { name: undefined, block: undefined, stray: [] };
  const end = A.reduce(nodes, start, (state, node): HeaderState => {
    if (state.name === undefined && hasTag(node, ["h1"])) {
      return { ...state, name: headingOf(node) };
    }
    if (state.block === undefined && hasTag(node, ["p"])) {
      return { ...state, block: readLabelBlock(node, resolve) };
    }
    return { ...state, stray: A.append(state.stray, node) };
  });
  return {
    header: { ...splitName(end.name ?? ""), ...end.block?.fields },
    stray: A.concat(end.block?.rest ?? [], end.stray),
  };
}

/** Text above the first section has one place to go: the summary. */
function withStray(
  sections: ReadonlyArray<MdSection>,
  stray: string,
): ReadonlyArray<MdSection> {
  if (S.isEmpty(stray)) return sections;
  const summary: MdSection = { type: "summary", title: "", body: stray };
  return O.mapWithDefault(
    A.getIndexBy(sections, (section) => section.type === "summary"),
    A.prepend(sections, summary),
    (index) =>
      A.updateAt(sections, index, (section) => ({
        ...section,
        body: A.join(
          A.filter([stray, section.body ?? ""], S.isNotEmpty),
          "\n\n",
        ),
      })),
  );
}

function isCustom(section: { type: SectionType }): boolean {
  return section.type === "custom";
}

function gridFlags(old: InterchangeSection): Readonly<Record<string, unknown>> {
  if (old.type !== "skills" && old.type !== "languages") return {};
  return { columns: old.columns, showProficiency: old.showProficiency };
}

/**
 * Markdown holds no presentation, so each section keeps the flags of the
 * section it replaces: a core section by type, a custom one by its place.
 */
function withFlags(
  sections: ReadonlyArray<MdSection>,
  previous: ReadonlyArray<InterchangeSection>,
): ReadonlyArray<unknown> {
  const customs = A.filter(sections, isCustom);
  const previousCustoms = A.filter(previous, isCustom);
  const previousOf = (section: MdSection) => {
    if (!isCustom(section)) {
      return A.find(previous, (item) => item.type === section.type);
    }
    return pipe(
      A.getIndexBy(customs, (item) => item === section),
      O.flatMap((index) => A.get(previousCustoms, index)),
    );
  };
  return A.map(sections, (section) =>
    O.mapWithDefault<InterchangeSection, unknown>(
      previousOf(section),
      section,
      (old) => ({ ...section, hidden: old.hidden, ...gridFlags(old) }),
    ),
  );
}

export interface MarkdownRead {
  /** A candidate interchange document, for `validateInterchange`. */
  doc: unknown;
  ignored: number;
}

/**
 * Reads a résumé from Markdown. The text holds the header and the sections,
 * and `base` gives the rest of the document: the title and every setting.
 */
export async function markdownToInterchange(
  text: string,
  base: InterchangeResume,
): Promise<MarkdownRead> {
  const split = splitAtTag(await parseMarkdown(text), "h2");
  const header = readHeader(split.before);
  const read = A.map(split.groups, readSection);
  const sections = withFlags(
    withStray(
      A.map(read, (item) => item.value),
      richText(header.stray),
    ),
    base.sections ?? [],
  );
  return {
    doc: { ...base, header: header.header, sections },
    ignored: A.reduce(read, 0, (sum, item) => sum + item.ignored),
  };
}
