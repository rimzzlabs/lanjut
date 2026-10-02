import { A, D, F, G, O, pipe, S } from "@mobily/ts-belt";
import type { JSONContent } from "@tiptap/core";
import {
  createCustomSection,
  createEmptyEntry,
  createEmptyResume,
  type Entry,
  emptyRichTextValue,
  type Field,
  type FieldKey,
  type Resume,
  type ResumeLanguage,
  type Section,
  type SectionType,
  updateSectionOfType,
  updateSections,
} from "@/lib/resume";
import { detectHeading, type HeadingMatch } from "./headings";

export interface ParseOptions {
  title: string;
  language: ResumeLanguage;
  templateId: string;
}

export interface ParseResult {
  resume: Resume;
  /** Text the parser could not confidently place into the structured document. */
  leftovers: string[];
}

// --- field builders --------------------------------------------------------

function plain(value: string): Field {
  return { kind: "plain", value: S.trim(value) };
}

const BULLET_RE = /^\s*[•·▪◦●*\-–—]\s+/;

function trimmedNonEmpty(lines: ReadonlyArray<string>): readonly string[] {
  return pipe(lines, A.map(S.trim), A.reject(S.isEmpty));
}

function paragraph(text: string): JSONContent {
  const trimmed = S.trim(text);
  if (S.isEmpty(trimmed)) return { type: "paragraph", content: [] };
  return { type: "paragraph", content: [{ type: "text", text: trimmed }] };
}

function bulletList(bullets: ReadonlyArray<string>): JSONContent {
  return {
    type: "bulletList",
    content: F.toMutable(
      A.map(bullets, (item) => ({
        type: "listItem",
        content: [paragraph(item)],
      })),
    ),
  };
}

interface RichBlocks {
  content: ReadonlyArray<JSONContent>;
  bullets: ReadonlyArray<string>;
}

function flushBullets(blocks: RichBlocks): ReadonlyArray<JSONContent> {
  if (A.isEmpty(blocks.bullets)) return blocks.content;
  return A.append(blocks.content, bulletList(blocks.bullets));
}

/** Consecutive bulleted lines become one bullet list, everything else a
 * paragraph, so the source structure survives the round trip. */
function richFromLines(lines: ReadonlyArray<string>): Field {
  const nonEmpty = trimmedNonEmpty(lines);
  if (A.isEmpty(nonEmpty)) {
    return { kind: "richtext", value: emptyRichTextValue() };
  }
  const initial: RichBlocks = { content: [], bullets: [] };
  const blocks = A.reduce(nonEmpty, initial, (acc, line) => {
    if (BULLET_RE.test(line)) {
      const bullet = S.replaceByRe(line, BULLET_RE, "");
      return { content: acc.content, bullets: A.append(acc.bullets, bullet) };
    }
    return {
      content: A.append(flushBullets(acc), paragraph(line)),
      bullets: [],
    };
  });
  const content = F.toMutable(flushBullets(blocks));
  return { kind: "richtext", value: { type: "doc", content } };
}

// --- header ----------------------------------------------------------------

const EMAIL_RE = /[\w.+-]+@[\w-]+\.[\w.-]+/;
const LINKEDIN_RE = /(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/[\w%-]+/i;
const URL_RE = /(?:https?:\/\/|www\.)[^\s|]+/i;
const URL_G_RE = /(?:https?:\/\/|www\.)[^\s|]+/gi;
const PHONE_RE = /\+?\d[\d\s().-]{7,}\d/;

function isContactLine(line: string): boolean {
  return (
    EMAIL_RE.test(line) ||
    LINKEDIN_RE.test(line) ||
    URL_RE.test(line) ||
    PHONE_RE.test(line)
  );
}

function looksLikeLocation(line: string): boolean {
  return (
    S.includes(line, ",") &&
    !/\d/.test(line) &&
    /^[A-Z]/.test(line) &&
    pipe(line, S.splitByRe(/\s+/), A.length) <= 6 &&
    !isContactLine(line)
  );
}

function splitName(fullName: string): { first: string; last: string } {
  const parts = pipe(
    fullName,
    S.trim,
    S.splitByRe(/\s+/),
    A.filter(G.isString),
    A.reject(S.isEmpty),
  );
  const [first = "", ...rest] = parts;
  return { first, last: A.join(rest, " ") };
}

type Fields = Record<FieldKey, Field>;

function setPlain(key: FieldKey, value: O.Option<string>) {
  return (fields: Fields): Fields =>
    O.mapWithDefault(value, fields, (text) => D.set(fields, key, plain(text)));
}

function nameFields(nameLine: O.Option<string>): Fields {
  if (O.isNone(nameLine)) return {};
  const { first, last } = splitName(nameLine);
  return { firstName: plain(first), lastName: plain(last) };
}

function locationFields(locationLine: O.Option<string>): Fields {
  if (O.isNone(locationLine)) return {};
  const [city = "", province = "", ...rest] = pipe(
    locationLine,
    S.split(","),
    A.map(S.trim),
  );
  return {
    city: plain(city),
    province: plain(province),
    country: plain(A.join(rest, ", ")),
  };
}

interface HeaderFill {
  resume: Resume;
  leftovers: ReadonlyArray<string>;
}

/**
 * Fill the header from the preamble (lines before the first heading) and
 * contacts found anywhere. Returns the filled résumé and the preamble lines
 * that were not used, to be added to the leftovers. Deliberately conservative:
 * only the first plausible name and headline are taken; nothing is guessed
 * beyond that.
 */
function fillHeader(
  resume: Resume,
  preamble: ReadonlyArray<string>,
  allText: string,
): HeaderFill {
  const email = pipe(S.match(allText, EMAIL_RE), O.mapNullable(A.head));
  const linkedin = pipe(S.match(allText, LINKEDIN_RE), O.mapNullable(A.head));
  const phone = pipe(S.match(allText, PHONE_RE), O.mapNullable(A.head));
  const website = pipe(
    O.getWithDefault(S.match(allText, URL_G_RE), []),
    A.filter(G.isString),
    A.find((url) => !/linkedin\.com/i.test(url)),
  );
  // The extra link only comes from the preamble: anywhere else, a second URL
  // is far more likely a company or project site from an entry.
  const link = pipe(
    O.getWithDefault(S.match(A.join(preamble, " "), URL_G_RE), []),
    A.filter(G.isString),
    A.find(
      (url) =>
        !/linkedin\.com/i.test(url) &&
        !O.contains(website, url) &&
        !S.includes(url, "@"),
    ),
  );

  const named = pipe(
    preamble,
    A.map(S.trim),
    A.reject((line) => S.isEmpty(line) || isContactLine(line)),
  );
  const nameLine = A.head(named);
  // Detect the location first so a "City, Region" line is not mistaken for the
  // headline, which is the next short non-location line (some résumés have none).
  const locationLine = A.find(
    named,
    (line) => !O.contains(nameLine, line) && looksLikeLocation(line),
  );
  const headlineLine = A.find(
    named,
    (line) =>
      !O.contains(nameLine, line) &&
      !O.contains(locationLine, line) &&
      pipe(line, S.splitByRe(/\s+/), A.length) <= 8,
  );
  const fields = pipe(
    resume.header.fields,
    setPlain("email", email),
    setPlain("phone", phone),
    setPlain("linkedin", linkedin),
    setPlain("website", website),
    setPlain("link", link),
    D.merge(nameFields(nameLine)),
    setPlain("jobTitle", headlineLine),
    D.merge(locationFields(locationLine)),
  );

  const used = new Set(
    pipe([nameLine, headlineLine, locationLine], A.filterMap(F.identity)),
  );
  const leftovers = pipe(
    preamble,
    A.map(S.trim),
    A.reject(
      (line) => S.isEmpty(line) || used.has(line) || isContactLine(line),
    ),
  );
  return {
    resume: { ...resume, header: { ...resume.header, fields } },
    leftovers,
  };
}

// --- sections --------------------------------------------------------------

const MONTH =
  "(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|januari|februari|maret|april|mei|juni|juli|agustus|september|oktober|november|desember)[a-z]*\\.?";
const DATE_TOKEN = `(?:${MONTH}\\s*)?\\d{4}`;
const DATE_END = `(?:${DATE_TOKEN}|present|sekarang|current|now|kini)`;
const DATE_RANGE_RE = new RegExp(
  `(${DATE_TOKEN})\\s*[-–—]{1,2}\\s*(${DATE_END})`,
  "i",
);

function findDateRange(
  lines: ReadonlyArray<string>,
): { start: string; end: string } | null {
  for (const line of lines) {
    const match = S.match(line, DATE_RANGE_RE);
    if (O.isSome(match)) {
      return {
        start: pipe(A.get(match, 1), O.getWithDefault(""), S.trim),
        end: pipe(A.get(match, 2), O.getWithDefault(""), S.trim),
      };
    }
  }
  return null;
}

type EntryLines = ReadonlyArray<ReadonlyArray<string>>;

interface EntrySplit {
  entries: EntryLines;
  current: ReadonlyArray<string>;
}

function closeEntry(split: EntrySplit): EntryLines {
  if (A.isEmpty(split.current)) return split.entries;
  return A.append(split.entries, split.current);
}

function splitEntries(lines: ReadonlyArray<string>): EntryLines {
  const initial: EntrySplit = { entries: [], current: [] };
  const split = A.reduce(lines, initial, (acc, line) => {
    if (S.isNotEmpty(S.trim(line))) {
      return { entries: acc.entries, current: A.append(acc.current, line) };
    }
    return { entries: closeEntry(acc), current: [] };
  });
  return closeEntry(split);
}

/**
 * Split a dated section (experience, education) into entries. When several lines
 * carry a date range, each begins a new entry (the common one-role-per-block
 * layout); otherwise fall back to blank-line boundaries.
 */
function splitDatedEntries(lines: ReadonlyArray<string>): EntryLines {
  const nonEmpty = A.filter(lines, (line) => S.isNotEmpty(S.trim(line)));
  const dateLines = pipe(
    nonEmpty,
    A.filter((line) => DATE_RANGE_RE.test(line)),
    A.length,
  );
  if (dateLines < 2) return splitEntries(lines);

  const initial: EntrySplit = { entries: [], current: [] };
  const split = A.reduce(nonEmpty, initial, (acc, line) => {
    if (DATE_RANGE_RE.test(line)) {
      return { entries: closeEntry(acc), current: [line] };
    }
    return { entries: acc.entries, current: A.append(acc.current, line) };
  });
  return closeEntry(split);
}

/** A short, capitalized line or one carrying a date range: a plausible entry
 * header (role, employer, dates) rather than a wrapped description sentence,
 * which starts lowercase. */
function looksLikeEntryHeader(line: string): boolean {
  const trimmed = S.trim(line);
  return (
    DATE_RANGE_RE.test(trimmed) ||
    (/^[A-Z0-9]/.test(trimmed) &&
      pipe(trimmed, S.splitByRe(/\s+/), A.length) <= 8)
  );
}

/**
 * Split an experience or education section into entries. When the block has
 * bullets, a new entry begins at each header-like line that follows bullet
 * content, which handles both "Role / Company / bullets" and the reversed
 * "Company / Role / bullets" layouts without orphaning the company. Falls back
 * to date/blank-line splitting when there are no bullets.
 */
interface ExperienceSplit extends EntrySplit {
  seenBullet: boolean;
}

function splitExperienceEntries(lines: ReadonlyArray<string>): EntryLines {
  const nonEmpty = A.filter(lines, (line) => S.isNotEmpty(S.trim(line)));
  if (!A.some(nonEmpty, (line) => BULLET_RE.test(line))) {
    return splitDatedEntries(nonEmpty);
  }
  const initial: ExperienceSplit = {
    entries: [],
    current: [],
    seenBullet: false,
  };
  const split = A.reduce(nonEmpty, initial, (acc, line) => {
    const isBullet = BULLET_RE.test(line);
    const startsEntry =
      !isBullet &&
      acc.seenBullet &&
      A.isNotEmpty(acc.current) &&
      looksLikeEntryHeader(line);
    if (startsEntry) {
      return { entries: closeEntry(acc), current: [line], seenBullet: false };
    }
    return {
      entries: acc.entries,
      current: A.append(acc.current, line),
      seenBullet: acc.seenBullet || isBullet,
    };
  });
  return closeEntry(split);
}

function splitItems(lines: ReadonlyArray<string>): readonly string[] {
  return pipe(
    lines,
    A.flatMap(S.splitByRe(/[,;•·|]/)),
    A.filter(G.isString),
    A.map(S.replaceByRe(BULLET_RE, "")),
    A.map(S.trim),
    A.reject(S.isEmpty),
  );
}

function stripDateRange(line: string): string {
  return pipe(
    line,
    S.replaceByRe(DATE_RANGE_RE, ""),
    S.replaceByRe(/^[\s|,·•–—-]+|[\s|,·•–—-]+$/g, ""),
    S.trim,
  );
}

interface EntryHeader {
  title?: string;
  subtitle?: string;
  descLines: ReadonlyArray<string>;
}

function isSubtitleLine(line: O.Option<string>): line is string {
  if (O.isNone(line) || BULLET_RE.test(line) || DATE_RANGE_RE.test(line)) {
    return false;
  }
  const stripped = stripDateRange(line);
  return (
    S.isNotEmpty(stripped) && pipe(stripped, S.splitByRe(/\s+/), A.length) <= 7
  );
}

/**
 * Pull the title and subtitle (role/employer, or degree/institution) from an
 * entry. The line carrying the date range is the title; the adjacent short line
 * is the subtitle, whether it sits above or below the date, so both
 * "Role dates / Company" and "Company / Role dates" layouts work. Everything
 * else is the description. With no date range, falls back to first-line title,
 * second short line subtitle.
 */
function extractEntryHeader(lines: ReadonlyArray<string>): EntryHeader {
  const dateIdx = A.getIndexBy(lines, (line) => DATE_RANGE_RE.test(line));
  if (O.isNone(dateIdx)) {
    let i = 0;
    let title: string | undefined;
    while (i < A.length(lines)) {
      const line = A.get(lines, i);
      if (O.isNone(line) || BULLET_RE.test(line)) break;
      const stripped = S.trim(line);
      i += 1;
      if (S.isNotEmpty(stripped)) {
        if (pipe(stripped, S.splitByRe(/\s+/), A.length) <= 10) {
          title = stripped;
        }
        break;
      }
    }
    let subtitle: string | undefined;
    const next = A.get(lines, i);
    if (isSubtitleLine(next)) {
      subtitle = S.trim(next);
      i += 1;
    }
    return { title, subtitle, descLines: A.sliceToEnd(lines, i) };
  }

  const used = new Set<number>([dateIdx]);
  const title = pipe(
    A.get(lines, dateIdx),
    O.map(stripDateRange),
    O.filter(S.isNotEmpty),
    O.toUndefined,
  );
  const before = A.get(lines, dateIdx - 1);
  const after = A.get(lines, dateIdx + 1);
  let subtitle: string | undefined;
  if (isSubtitleLine(before)) {
    subtitle = S.trim(before);
    used.add(dateIdx - 1);
  } else if (isSubtitleLine(after)) {
    subtitle = S.trim(after);
    used.add(dateIdx + 1);
  }
  return {
    title,
    subtitle,
    descLines: A.filterWithIndex(lines, (idx) => !used.has(idx)),
  };
}

// Legal-form suffixes that mark a comma tail as part of a company name.
const COMPANY_SUFFIXES = new Set([
  "inc",
  "llc",
  "llp",
  "ltd",
  "corp",
  "co",
  "gmbh",
  "plc",
  "pte",
  "pt",
  "tbk",
  "cv",
  "bv",
  "sa",
  "ag",
  "ab",
]);

const WORKPLACE_WORDS = new Set(["remote", "hybrid", "onsite", "on-site"]);

function isLocationSegment(segment: string): boolean {
  return (
    /^[A-Z]/.test(segment) &&
    !/\d/.test(segment) &&
    !S.includes(segment, "&") &&
    pipe(segment, S.splitByRe(/\s+/), A.length) <= 3 &&
    !COMPANY_SUFFIXES.has(
      pipe(segment, S.toLowerCase, S.replaceByRe(/\./g, "")),
    )
  );
}

/**
 * Split "Acme Corp, San Francisco, CA" into a subject and a location tail.
 * Exports join the company or institution with its location by ", ", but both
 * halves can hold commas themselves, so a tail is only taken when it clearly
 * reads as a place: a multi-part "City, Region[, Country]" tail, a region
 * code, or a workplace word such as Remote. Anything ambiguous stays in the
 * subject, which is the pre-split behavior.
 */
function splitSubtitleLocation(subtitle: string): {
  subject: string;
  location?: string;
} {
  const segments = pipe(
    subtitle,
    S.split(","),
    A.map(S.trim),
    A.reject(S.isEmpty),
  );
  const maxTail = Math.min(3, A.length(segments) - 1);
  for (let take = maxTail; take >= 1; take -= 1) {
    const tail = A.sliceToEnd(segments, A.length(segments) - take);
    if (!A.every(tail, isLocationSegment)) continue;
    if (take === 1) {
      const only = A.head(tail);
      if (O.isNone(only)) continue;
      const isWorkplaceWord = WORKPLACE_WORDS.has(S.toLowerCase(only));
      const isRegionCode = /^[A-Z]{2,3}$/.test(only);
      if (!isWorkplaceWord && !isRegionCode) continue;
    }
    return {
      subject: pipe(segments, A.take(A.length(segments) - take), A.join(", ")),
      location: A.join(tail, ", "),
    };
  }
  return { subject: subtitle };
}

interface SubtitleTarget {
  key: FieldKey;
  subtitle: string;
  withLocation: boolean;
}

function subtitleFields(target: SubtitleTarget): Fields {
  const { key, subtitle, withLocation } = target;
  if (!withLocation) return { [key]: plain(subtitle) };
  const { subject, location } = splitSubtitleLocation(subtitle);
  if (!location) return { [key]: plain(subject) };
  return { [key]: plain(subject), location: plain(location) };
}

function plainIfPresent(key: FieldKey, value: string | undefined): Fields {
  if (value === undefined || S.isEmpty(value)) return {};
  return { [key]: plain(value) };
}

function dateFields(lines: ReadonlyArray<string>): Fields {
  const range = findDateRange(lines);
  if (!range) return {};
  return { startDate: plain(range.start), endDate: plain(range.end) };
}

interface DatedKeys {
  title: FieldKey;
  subject: FieldKey;
  body: FieldKey;
  withLocation: boolean;
}

function subjectFields(keys: DatedKeys, subtitle: string | undefined): Fields {
  if (subtitle === undefined || S.isEmpty(subtitle)) return {};
  const { subject: key, withLocation } = keys;
  return subtitleFields({ key, subtitle, withLocation });
}

function datedEntry(type: SectionType, keys: DatedKeys) {
  return (lines: ReadonlyArray<string>): Entry => {
    const base = createEmptyEntry(type);
    const { title, subtitle, descLines } = extractEntryHeader(lines);
    return {
      ...base,
      fields: {
        ...base.fields,
        ...dateFields(lines),
        ...plainIfPresent(keys.title, title),
        ...subjectFields(keys, subtitle),
        [keys.body]: richFromLines(descLines),
      },
    };
  };
}

function experienceKeys(type: SectionType): DatedKeys {
  if (type === "organizations") {
    return {
      title: "role",
      subject: "organization",
      body: "description",
      withLocation: false,
    };
  }
  return {
    title: "title",
    subject: "company",
    body: "description",
    withLocation: type === "experience" || type === "internship",
  };
}

const EDUCATION_KEYS: DatedKeys = {
  title: "degree",
  subject: "institution",
  body: "details",
  withLocation: true,
};

function fillExperienceLike(
  section: Section,
  lines: ReadonlyArray<string>,
): Section {
  const entries = A.map(
    splitExperienceEntries(lines),
    datedEntry(section.type, experienceKeys(section.type)),
  );
  return { ...section, entries: A.concat(section.entries, entries) };
}

function fillEducation(
  section: Section,
  lines: ReadonlyArray<string>,
): Section {
  const entries = A.map(
    splitExperienceEntries(lines),
    datedEntry("education", EDUCATION_KEYS),
  );
  return { ...section, entries: A.concat(section.entries, entries) };
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

function fillCertifications(
  section: Section,
  lines: ReadonlyArray<string>,
): Section {
  const entries = A.reduce(
    trimmedNonEmpty(lines),
    section.entries,
    (acc, line) => {
      // A URL line is the verification link of the preceding certificate, not
      // a certificate of its own.
      if (URL_RE.test(line) && A.isNotEmpty(acc)) {
        return A.updateAt(acc, A.length(acc) - 1, withUrl(line));
      }
      const base = createEmptyEntry("certifications");
      const name = plain(S.replaceByRe(line, BULLET_RE, ""));
      return A.append(acc, { ...base, fields: { ...base.fields, name } });
    },
  );
  return { ...section, entries };
}

function fillSummary(section: Section, lines: ReadonlyArray<string>): Section {
  const entry = {
    ...createEmptyEntry("summary"),
    fields: { body: richFromLines(lines) },
  };
  return { ...section, entries: A.append(section.entries, entry) };
}

function fillSection(section: Section, lines: ReadonlyArray<string>): Section {
  switch (section.type) {
    case "summary":
      return fillSummary(section, lines);
    case "experience":
    case "internship":
    case "projects":
    case "organizations":
      return fillExperienceLike(section, lines);
    case "education":
      return fillEducation(section, lines);
    case "certifications":
      return fillCertifications(section, lines);
    case "skills":
    case "languages":
      return fillNamedList(section, lines);
    default:
      return section;
  }
}

function customSection(heading: HeadingMatch, lines: ReadonlyArray<string>) {
  const custom = createCustomSection("rich", heading.title);
  const entries = A.updateAt(custom.entries, 0, (entry) => ({
    ...entry,
    fields: { ...entry.fields, body: richFromLines(lines) },
  }));
  return { ...custom, entries };
}

function fillBlock(resume: Resume, block: Block): Resume {
  const { heading, lines } = block;
  if (heading === null) return resume;
  if (heading.type === "custom") {
    const sections = A.append(resume.sections, customSection(heading, lines));
    return { ...resume, sections };
  }
  return updateSections(
    resume,
    updateSectionOfType(heading.type, (section) => fillSection(section, lines)),
  );
}

// --- entry point -----------------------------------------------------------

/**
 * Rejoin soft-wrapped lines. PDF text extraction breaks a paragraph or bullet at
 * every visual line, so a single sentence arrives as several lines. A line is a
 * continuation of the previous one when it does not start a new bullet, heading,
 * dated header, or contact, the previous line did not end a sentence, and it
 * either starts lowercase or completes a hyphenated word split. Merging these
 * keeps a wrapped bullet as one item and stops a fragment being read as a header.
 */
function reassembleLines(
  rawLines: ReadonlyArray<string>,
): ReadonlyArray<string> {
  const initial: ReadonlyArray<string> = [];
  return A.reduce(rawLines, initial, (result, raw) => {
    const line = S.trim(raw);
    if (S.isEmpty(line)) return result;
    const prev = A.last(result);
    const isContinuation =
      O.isSome(prev) &&
      !BULLET_RE.test(line) &&
      !DATE_RANGE_RE.test(line) &&
      !isContactLine(line) &&
      !/[.!?:]$/.test(prev) &&
      (/^[a-z]/.test(line) || /[-–—]$/.test(prev));
    if (!isContinuation) return A.append(result, line);
    const lastIdx = A.length(result) - 1;
    if (/[-–—]$/.test(prev)) {
      return A.replaceAt(
        result,
        lastIdx,
        S.replaceByRe(prev, /[-–—]$/, "") + line,
      );
    }
    return A.replaceAt(result, lastIdx, `${prev} ${line}`);
  });
}

interface Block {
  heading: HeadingMatch | null;
  lines: ReadonlyArray<string>;
}

interface BlockSplit {
  blocks: ReadonlyArray<Block>;
  seenRecognizedHeading: boolean;
}

// Everything before the first recognized section is the preamble (name,
// contacts, location). A custom (all-caps) heading there is really the name,
// so custom headings are only honored once a recognized section has started.
function blockHeading(
  line: string,
  seenRecognizedHeading: boolean,
): HeadingMatch | null {
  if (S.isEmpty(S.trim(line))) return null;
  const heading = detectHeading(line);
  if (heading?.type === "custom" && !seenRecognizedHeading) return null;
  return heading;
}

function appendLine(line: string) {
  return (block: Block): Block => ({
    ...block,
    lines: A.append(block.lines, line),
  });
}

function splitBlocks(lines: ReadonlyArray<string>): ReadonlyArray<Block> {
  const initial: BlockSplit = {
    blocks: [{ heading: null, lines: [] }],
    seenRecognizedHeading: false,
  };
  const split = A.reduce(lines, initial, (acc, line) => {
    const heading = blockHeading(line, acc.seenRecognizedHeading);
    if (heading === null) {
      const lastIdx = A.length(acc.blocks) - 1;
      return {
        ...acc,
        blocks: A.updateAt(acc.blocks, lastIdx, appendLine(line)),
      };
    }
    return {
      blocks: A.append(acc.blocks, { heading, lines: [] }),
      seenRecognizedHeading:
        acc.seenRecognizedHeading || heading.type !== "custom",
    };
  });
  return split.blocks;
}

/**
 * Parse extracted résumé text into a structured document. Conservative by
 * design: fills only high-confidence data (contacts, dates, section text),
 * routes unrecognized headings to custom sections, and returns anything it
 * cannot place as leftovers rather than guessing.
 */
export function parseResumeText(text: string, opts: ParseOptions): ParseResult {
  const base: Resume = {
    ...createEmptyResume(opts.title),
    language: opts.language,
    templateId: opts.templateId,
  };
  const lines = reassembleLines(
    pipe(text, S.splitByRe(/\r?\n/), A.filter(G.isString)),
  );
  const blocks = splitBlocks(lines);
  const preamble = pipe(
    A.head(blocks),
    O.filter((block) => block.heading === null),
    O.match(
      (block): ReadonlyArray<string> => block.lines,
      () => [],
    ),
  );
  const header = fillHeader(base, preamble, text);
  const resume = A.reduce(blocks, header.resume, fillBlock);
  return { resume, leftovers: F.toMutable(header.leftovers) };
}
