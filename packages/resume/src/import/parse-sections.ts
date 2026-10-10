import { A, G, O, pipe, S } from "@mobily/ts-belt";
import {
  createCustomSection,
  createEmptyEntry,
  type Entry,
  type Field,
  type Resume,
  type Section,
  type SectionType,
  updateSectionOfType,
  updateSections,
} from "..";
import { getSectionSchema } from "../schema-registry";
import type { TemplateId } from "../templates";
import type { HeadingMatch } from "./headings";
import { findUrls, type PdfLink, urlKey } from "./links";
import {
  type DatedKeys,
  datedEntry,
  EDUCATION_KEYS,
  entryLayout,
  experienceKeys,
  plainIfPresent,
  subjectDated,
} from "./parse-entry-fields";
import { splitExperienceEntries, splitItems } from "./parse-entry-split";
import {
  BULLET_RE,
  isLinkLine,
  plain,
  richFromLines,
  trimmedNonEmpty,
} from "./parse-rich-lines";

export interface ParseContext {
  links: ReadonlyArray<PdfLink>;
  /** Keys (`urlKey`) of the addresses the header already holds. */
  headerUrls: ReadonlySet<string>;
  /** The template that made the PDF, when Lanjut made it. */
  source?: TemplateId;
}

export interface ParseState {
  resume: Resume;
  leftovers: ReadonlyArray<string>;
}

interface SectionFill {
  section: Section;
  leftovers: ReadonlyArray<string>;
}

interface LinkSplit {
  lines: ReadonlyArray<string>;
  urls: ReadonlyArray<string>;
}

/**
 * Takes the lines that hold only links out of a block, so an address is never
 * shown as text. The addresses fill a link field or go to the leftovers. One
 * that the header already holds is dropped, so nothing appears twice.
 */
function splitLinkLines(
  lines: ReadonlyArray<string>,
  context: ParseContext,
): LinkSplit {
  const urls = pipe(
    A.filter(lines, (line) => isLinkLine(line)),
    A.flatMap(findUrls),
    A.reject((url) => context.headerUrls.has(urlKey(url))),
    A.uniqBy(urlKey),
  );
  return { lines: A.reject(lines, (line) => isLinkLine(line)), urls };
}

function hasWebsite(type: SectionType): boolean {
  return A.some(
    getSectionSchema(type).fields,
    (field) => field.key === "website",
  );
}

function plainValue(field: Field | undefined): string {
  if (field?.kind !== "plain") return "";
  return S.trim(field.value);
}

/** The target of a PDF link drawn on exactly this text, such as a project name. */
function labelTarget(
  text: string,
  links: ReadonlyArray<PdfLink>,
): O.Option<string> {
  if (S.isEmpty(text)) return undefined;
  return pipe(
    links,
    A.find((link) => S.trim(link.label) === text),
    O.map((link) => link.url),
  );
}

/**
 * The target of a PDF link that sits on one of an entry's heading lines, the
 * lines above its first bullet. Matches where the link's run also holds other
 * text, such as a company link inside "Acme Corp, San Francisco, CA".
 */
function headingLineTarget(
  lines: ReadonlyArray<string>,
  context: ParseContext,
): O.Option<string> {
  const heading = pipe(
    lines,
    A.takeWhile((line) => !BULLET_RE.test(line)),
    A.map(S.trim),
  );
  return pipe(
    context.links,
    A.find(
      (link) =>
        S.isNotEmpty(link.line) &&
        A.includes(heading, link.line) &&
        !context.headerUrls.has(urlKey(link.url)),
    ),
    O.map((link) => link.url),
  );
}

/**
 * An entry's own address: a link line inside it, else a link on its title or
 * subject, else a link on one of its heading lines.
 */
function entryWebsite(
  entry: Entry,
  keys: DatedKeys,
  split: LinkSplit,
  context: ParseContext,
): O.Option<string> {
  const written = A.head(split.urls);
  if (O.isSome(written)) return written;
  const title = labelTarget(
    plainValue(entry.fields[keys.title]),
    context.links,
  );
  if (O.isSome(title)) return title;
  const subject = labelTarget(
    plainValue(entry.fields[keys.subject]),
    context.links,
  );
  if (O.isSome(subject)) return subject;
  return headingLineTarget(split.lines, context);
}

interface EntryFill {
  entry: O.Option<Entry>;
  leftovers: ReadonlyArray<string>;
}

function datedFill(section: Section, keys: DatedKeys, context: ParseContext) {
  return (lines: ReadonlyArray<string>): EntryFill => {
    const split = splitLinkLines(lines, context);
    if (A.isEmpty(trimmedNonEmpty(split.lines))) {
      return { entry: undefined, leftovers: split.urls };
    }
    const entry = datedEntry(
      section.type,
      keys,
      context.links,
      context.source,
    )(split.lines);
    if (!hasWebsite(section.type)) return { entry, leftovers: split.urls };
    const website = entryWebsite(entry, keys, split, context);
    if (O.isNone(website)) return { entry, leftovers: split.urls };
    return {
      entry: { ...entry, fields: { ...entry.fields, website: plain(website) } },
      leftovers: A.reject(split.urls, (url) => url === website),
    };
  };
}

function fillDated(
  section: Section,
  lines: ReadonlyArray<string>,
  keys: DatedKeys,
  context: ParseContext,
): SectionFill {
  const fills = A.map(
    splitExperienceEntries(
      lines,
      subjectDated(entryLayout(keys, context.source)),
    ),
    datedFill(section, keys, context),
  );
  return {
    section: {
      ...section,
      entries: A.concat(
        section.entries,
        A.filterMap(fills, (fill) => fill.entry),
      ),
    },
    leftovers: A.flatMap(fills, (fill) => fill.leftovers),
  };
}

// Proficiency words (en + id) that end a skill or language item. Detecting them
// splits a "Name Level Name Level" run, which is how a two-column skills grid
// extracts once its columns are merged onto one line.
const PROFICIENCY_WORDS = new Set([
  "expert",
  "advanced",
  "intermediate",
  "beginner",
  "proficient",
  "fluent",
  "native",
  "professional",
  "conversational",
  "competent",
  "familiar",
  "basic",
  "elementary",
  "working",
  "ahli",
  "mahir",
  "menengah",
  "pemula",
  "lancar",
  "fasih",
  "dasar",
  "aktif",
  "pasif",
]);

function isProficiency(word: string): boolean {
  return PROFICIENCY_WORDS.has(
    pipe(word, S.toLowerCase, S.replaceByRe(/[^a-z]/g, "")),
  );
}

interface ProficiencyPair {
  name: string;
  level: string;
}

interface PairSplit {
  pairs: ReadonlyArray<ProficiencyPair>;
  nameWords: ReadonlyArray<string>;
}

function cleanName(words: ReadonlyArray<string>): string {
  return pipe(words, A.join(" "), S.replaceByRe(/[\s\-–—:,|•]+$/, ""), S.trim);
}

function splitProficiencyPairs(text: string): ReadonlyArray<ProficiencyPair> {
  const words = pipe(
    text,
    S.splitByRe(/\s+/),
    A.filter(G.isString),
    A.reject(S.isEmpty),
  );
  const initial: PairSplit = { pairs: [], nameWords: [] };
  const split = A.reduce(words, initial, (acc, word) => {
    if (isProficiency(word) && A.isNotEmpty(acc.nameWords)) {
      const pair = {
        name: cleanName(acc.nameWords),
        level: S.replaceByRe(word, /[.,;:]+$/, ""),
      };
      return { pairs: A.append(acc.pairs, pair), nameWords: [] };
    }
    return { pairs: acc.pairs, nameWords: A.append(acc.nameWords, word) };
  });
  const trailing = cleanName(split.nameWords);
  if (S.isEmpty(trailing)) return split.pairs;
  return A.append(split.pairs, { name: trailing, level: "" });
}

/** Fill a skills or languages section: name/level pairs when proficiency words
 * are present (also un-merging a two-column grid), otherwise a delimited list. */
function fillNamedList(
  section: Section,
  lines: ReadonlyArray<string>,
): Section {
  const text = pipe(
    lines,
    A.map(S.replaceByRe(BULLET_RE, "")),
    A.map(S.trim),
    A.reject(S.isEmpty),
    A.join(" "),
  );

  if (
    pipe(text, S.splitByRe(/\s+/), A.filter(G.isString), A.some(isProficiency))
  ) {
    const pairs = A.map(splitProficiencyPairs(text), (pair): Entry => {
      const base = createEmptyEntry(section.type);
      return {
        ...base,
        fields: {
          ...base.fields,
          name: plain(pair.name),
          ...plainIfPresent("level", pair.level),
        },
      };
    });
    return { ...section, entries: A.concat(section.entries, pairs) };
  }

  const items = A.map(splitItems(lines), (item): Entry => {
    const base = createEmptyEntry(section.type);
    return { ...base, fields: { ...base.fields, name: plain(item) } };
  });
  return { ...section, entries: A.concat(section.entries, items) };
}

function withUrl(url: string) {
  return (entry: Entry): Entry => ({
    ...entry,
    fields: { ...entry.fields, url: plain(url) },
  });
}

function certificateName(line: string): string {
  return pipe(
    A.reduce(findUrls(line), S.replaceByRe(line, BULLET_RE, ""), (text, url) =>
      S.replaceAll(text, url, ""),
    ),
    S.replaceByRe(/[\s\-–—:|•·,;(]+$/, ""),
    S.trim,
  );
}

interface CertificateFill {
  entries: ReadonlyArray<Entry>;
  leftovers: ReadonlyArray<string>;
}

function attachUrl(acc: CertificateFill, line: string): CertificateFill {
  const urls = findUrls(line);
  const last = A.last(acc.entries);
  const free = O.mapWithDefault(last, false, (entry) =>
    S.isEmpty(plainValue(entry.fields.url)),
  );
  const first = A.head(urls);
  if (!free || O.isNone(first)) {
    return { ...acc, leftovers: A.concat(acc.leftovers, urls) };
  }
  return {
    entries: A.updateAt(acc.entries, A.length(acc.entries) - 1, withUrl(first)),
    leftovers: A.concat(acc.leftovers, A.drop(urls, 1)),
  };
}

// Words of a certificate's name, never of the body that issues it.
const CERTIFICATE_WORDS =
  /\b(?:certified|certificate|certification|associate|professional|specialist|developer|engineer|architect|administrator|practitioner|fundamentals|expert)\b/i;

function looksLikeIssuer(text: string): boolean {
  return (
    !/\d/.test(text) &&
    !CERTIFICATE_WORDS.test(text) &&
    pipe(text, S.splitByRe(/\s+/), A.length) <= 6
  );
}

/**
 * Lanjut prints a certificate's name, then its issuer on the next line. Other
 * résumés often print one certificate per line, so a line becomes the issuer
 * only with evidence: the PDF names its Lanjut template, or the name above
 * carries its own link. The line itself must carry no link and read like an
 * issuer.
 */
function wantsIssuer(
  acc: CertificateFill,
  line: string,
  linked: O.Option<string>,
  context: ParseContext,
): boolean {
  const ready = O.mapWithDefault(
    A.last(acc.entries),
    false,
    (entry) =>
      S.isEmpty(plainValue(entry.fields.issuer)) &&
      (context.source !== undefined ||
        S.isNotEmpty(plainValue(entry.fields.url))),
  );
  return (
    ready &&
    O.isNone(linked) &&
    A.isEmpty(findUrls(line)) &&
    looksLikeIssuer(certificateName(line))
  );
}

function withIssuer(acc: CertificateFill, issuer: string): CertificateFill {
  return {
    ...acc,
    entries: A.updateAt(
      acc.entries,
      A.length(acc.entries) - 1,
      (entry): Entry => ({
        ...entry,
        fields: { ...entry.fields, issuer: plain(issuer) },
      }),
    ),
  };
}

function fillCertifications(
  section: Section,
  lines: ReadonlyArray<string>,
  context: ParseContext,
): SectionFill {
  const initial: CertificateFill = { entries: section.entries, leftovers: [] };
  const fill = A.reduce(trimmedNonEmpty(lines), initial, (acc, line) => {
    const name = certificateName(line);
    // A line of links is the verification link of the certificate above it,
    // not a certificate of its own.
    if (isLinkLine(line) || S.isEmpty(name)) return attachUrl(acc, line);
    const linked = labelTarget(name, context.links);
    if (wantsIssuer(acc, line, linked, context)) return withIssuer(acc, name);
    const url = either(A.head(findUrls(line)), () => linked);
    const base = createEmptyEntry("certifications");
    const entry: Entry = {
      ...base,
      fields: {
        ...base.fields,
        name: plain(name),
        ...plainIfPresent("url", O.toUndefined(url)),
      },
    };
    return { ...acc, entries: A.append(acc.entries, entry) };
  });
  return {
    section: { ...section, entries: fill.entries },
    leftovers: fill.leftovers,
  };
}

function either(
  first: O.Option<string>,
  second: () => O.Option<string>,
): O.Option<string> {
  return O.isSome(first) ? first : second();
}

function fillSummary(
  section: Section,
  lines: ReadonlyArray<string>,
  context: ParseContext,
): SectionFill {
  const split = splitLinkLines(lines, context);
  const entry = {
    ...createEmptyEntry("summary"),
    fields: { body: richFromLines(split.lines, context.links) },
  };
  return {
    section: { ...section, entries: A.append(section.entries, entry) },
    leftovers: split.urls,
  };
}

function fillLists(
  section: Section,
  lines: ReadonlyArray<string>,
  context: ParseContext,
): SectionFill {
  const split = splitLinkLines(lines, context);
  return {
    section: fillNamedList(section, split.lines),
    leftovers: split.urls,
  };
}

function fillSection(
  section: Section,
  lines: ReadonlyArray<string>,
  context: ParseContext,
): SectionFill {
  switch (section.type) {
    case "summary":
      return fillSummary(section, lines, context);
    case "experience":
    case "internship":
    case "projects":
    case "organizations":
      return fillDated(section, lines, experienceKeys(section.type), context);
    case "education":
      return fillDated(section, lines, EDUCATION_KEYS, context);
    case "certifications":
      return fillCertifications(section, lines, context);
    case "skills":
    case "languages":
      return fillLists(section, lines, context);
    default:
      return { section, leftovers: [] };
  }
}

// A custom section keeps its link lines: a "Links" section is all links.
function customSection(
  heading: HeadingMatch,
  lines: ReadonlyArray<string>,
  links: ReadonlyArray<PdfLink>,
) {
  const custom = createCustomSection("rich", heading.title);
  const entries = A.updateAt(custom.entries, 0, (entry) => ({
    ...entry,
    fields: { ...entry.fields, body: richFromLines(lines, links) },
  }));
  return { ...custom, entries };
}

export function fillBlock(context: ParseContext) {
  return (state: ParseState, block: Block): ParseState => {
    const { heading, lines } = block;
    if (heading === null) return state;
    if (heading.type === "custom") {
      const custom = customSection(heading, lines, context.links);
      const sections = A.append(state.resume.sections, custom);
      return { ...state, resume: { ...state.resume, sections } };
    }
    const type = heading.type;
    const target = A.find(state.resume.sections, (s) => s.type === type);
    if (O.isNone(target)) return state;
    const fill = fillSection(target, lines, context);
    return {
      resume: updateSections(
        state.resume,
        updateSectionOfType(type, () => fill.section),
      ),
      leftovers: A.concat(state.leftovers, fill.leftovers),
    };
  };
}

export interface Block {
  heading: HeadingMatch | null;
  lines: ReadonlyArray<string>;
}
