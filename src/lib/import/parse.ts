import { A, G, pipe, S } from "@mobily/ts-belt";
import type { JSONContent } from "@tiptap/core";
import {
  createCustomSection,
  createEmptyEntry,
  createEmptyResume,
  emptyRichTextValue,
  type Field,
  type Resume,
  type ResumeLanguage,
  type Section,
  type SectionType,
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
  return { kind: "plain", value: value.trim() };
}

const BULLET_RE = /^\s*[•·▪◦●*\-–—]\s+/;

function trimmedNonEmpty(lines: string[]): readonly string[] {
  return pipe(lines, A.map(S.trim), A.reject(S.isEmpty));
}

function paragraph(text: string): JSONContent {
  const trimmed = text.trim();
  return {
    type: "paragraph",
    content: trimmed ? [{ type: "text", text: trimmed }] : [],
  };
}

/** Consecutive bulleted lines become one bullet list, everything else a
 * paragraph, so the source structure survives the round trip. */
function richFromLines(lines: string[]): Field {
  const nonEmpty = trimmedNonEmpty(lines);
  if (nonEmpty.length === 0) {
    return { kind: "richtext", value: emptyRichTextValue() };
  }
  const content: JSONContent[] = [];
  let bullets: string[] = [];
  const flushBullets = () => {
    if (bullets.length === 0) return;
    content.push({
      type: "bulletList",
      content: bullets.map((item) => ({
        type: "listItem",
        content: [paragraph(item)],
      })),
    });
    bullets = [];
  };
  for (const line of nonEmpty) {
    if (BULLET_RE.test(line)) {
      bullets.push(line.replace(BULLET_RE, ""));
    } else {
      flushBullets();
      content.push(paragraph(line));
    }
  }
  flushBullets();
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
    line.includes(",") &&
    !/\d/.test(line) &&
    /^[A-Z]/.test(line) &&
    line.split(/\s+/).length <= 6 &&
    !isContactLine(line)
  );
}

function splitName(fullName: string): { first: string; last: string } {
  const parts = pipe(fullName.trim().split(/\s+/), A.reject(S.isEmpty));
  const [first = "", ...rest] = parts;
  return { first, last: rest.join(" ") };
}

/**
 * Fill the header from the preamble (lines before the first heading) and
 * contacts found anywhere. Returns the preamble lines that were not used, to be
 * added to the leftovers. Deliberately conservative: only the first plausible
 * name and headline are taken; nothing is guessed beyond that.
 */
function fillHeader(
  resume: Resume,
  preamble: string[],
  allText: string,
): string[] {
  const fields = resume.header.fields;

  const email = allText.match(EMAIL_RE)?.[0];
  const linkedin = allText.match(LINKEDIN_RE)?.[0];
  const phone = allText.match(PHONE_RE)?.[0];
  const website = (allText.match(URL_G_RE) ?? []).find(
    (url) => !/linkedin\.com/i.test(url),
  );
  if (email) fields.email = plain(email);
  if (phone) fields.phone = plain(phone);
  if (linkedin) fields.linkedin = plain(linkedin);
  if (website) fields.website = plain(website);

  const named = pipe(
    preamble,
    A.map(S.trim),
    A.reject((line) => S.isEmpty(line) || isContactLine(line)),
  );
  const nameLine = named[0];
  // Detect the location first so a "City, Region" line is not mistaken for the
  // headline, which is the next short non-location line (some résumés have none).
  const locationLine = named.find(
    (line) => line !== nameLine && looksLikeLocation(line),
  );
  const headlineLine = named.find(
    (line) =>
      line !== nameLine &&
      line !== locationLine &&
      line.split(/\s+/).length <= 8,
  );
  if (nameLine) {
    const { first, last } = splitName(nameLine);
    fields.firstName = plain(first);
    fields.lastName = plain(last);
  }
  if (headlineLine) fields.jobTitle = plain(headlineLine);

  if (locationLine) {
    const [city = "", province = "", ...rest] = locationLine
      .split(",")
      .map((part) => part.trim());
    fields.city = plain(city);
    fields.province = plain(province);
    fields.country = plain(rest.join(", "));
  }

  const used = new Set(
    pipe([nameLine, headlineLine, locationLine], A.filter(G.isString)),
  );
  return [
    ...pipe(
      preamble,
      A.map(S.trim),
      A.reject(
        (line) => S.isEmpty(line) || used.has(line) || isContactLine(line),
      ),
    ),
  ];
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

function findDateRange(lines: string[]): { start: string; end: string } | null {
  for (const line of lines) {
    const match = line.match(DATE_RANGE_RE);
    if (match) return { start: match[1].trim(), end: match[2].trim() };
  }
  return null;
}

function splitEntries(lines: string[]): string[][] {
  const entries: string[][] = [];
  let current: string[] = [];
  for (const line of lines) {
    if (line.trim()) {
      current.push(line);
    } else if (current.length > 0) {
      entries.push(current);
      current = [];
    }
  }
  if (current.length > 0) entries.push(current);
  return entries;
}

/**
 * Split a dated section (experience, education) into entries. When several lines
 * carry a date range, each begins a new entry (the common one-role-per-block
 * layout); otherwise fall back to blank-line boundaries.
 */
function splitDatedEntries(lines: string[]): string[][] {
  const nonEmpty = lines.filter((line) => line.trim());
  const dateLines = nonEmpty.filter((line) => DATE_RANGE_RE.test(line)).length;
  if (dateLines < 2) return splitEntries(lines);

  const entries: string[][] = [];
  let current: string[] = [];
  for (const line of nonEmpty) {
    if (DATE_RANGE_RE.test(line) && current.length > 0) {
      entries.push(current);
      current = [];
    }
    current.push(line);
  }
  if (current.length > 0) entries.push(current);
  return entries;
}

/** A short, capitalized line or one carrying a date range: a plausible entry
 * header (role, employer, dates) rather than a wrapped description sentence,
 * which starts lowercase. */
function looksLikeEntryHeader(line: string): boolean {
  const trimmed = line.trim();
  return (
    DATE_RANGE_RE.test(trimmed) ||
    (/^[A-Z0-9]/.test(trimmed) && trimmed.split(/\s+/).length <= 8)
  );
}

/**
 * Split an experience or education section into entries. When the block has
 * bullets, a new entry begins at each header-like line that follows bullet
 * content, which handles both "Role / Company / bullets" and the reversed
 * "Company / Role / bullets" layouts without orphaning the company. Falls back
 * to date/blank-line splitting when there are no bullets.
 */
function splitExperienceEntries(lines: string[]): string[][] {
  const nonEmpty = lines.filter((line) => line.trim());
  if (!nonEmpty.some((line) => BULLET_RE.test(line))) {
    return splitDatedEntries(nonEmpty);
  }
  const entries: string[][] = [];
  let current: string[] = [];
  let seenBullet = false;
  for (const line of nonEmpty) {
    const isBullet = BULLET_RE.test(line);
    if (
      !isBullet &&
      seenBullet &&
      current.length > 0 &&
      looksLikeEntryHeader(line)
    ) {
      entries.push(current);
      current = [];
      seenBullet = false;
    }
    current.push(line);
    if (isBullet) seenBullet = true;
  }
  if (current.length > 0) entries.push(current);
  return entries;
}

function splitItems(lines: string[]): readonly string[] {
  return pipe(
    lines,
    A.flatMap((line) => line.split(/[,;•·|]/)),
    A.map((item) => item.replace(BULLET_RE, "").trim()),
    A.reject(S.isEmpty),
  );
}

function sectionOfType(resume: Resume, type: SectionType): Section | undefined {
  return resume.sections.find((section) => section.type === type);
}

function stripDateRange(line: string): string {
  return line
    .replace(DATE_RANGE_RE, "")
    .replace(/^[\s|,·•–—-]+|[\s|,·•–—-]+$/g, "")
    .trim();
}

interface EntryHeader {
  title?: string;
  subtitle?: string;
  descLines: string[];
}

function isSubtitleLine(line: string | undefined): line is string {
  if (line === undefined || BULLET_RE.test(line) || DATE_RANGE_RE.test(line)) {
    return false;
  }
  const stripped = stripDateRange(line);
  return stripped.length > 0 && stripped.split(/\s+/).length <= 7;
}

/**
 * Pull the title and subtitle (role/employer, or degree/institution) from an
 * entry. The line carrying the date range is the title; the adjacent short line
 * is the subtitle, whether it sits above or below the date, so both
 * "Role dates / Company" and "Company / Role dates" layouts work. Everything
 * else is the description. With no date range, falls back to first-line title,
 * second short line subtitle.
 */
function extractEntryHeader(lines: string[]): EntryHeader {
  const dateIdx = lines.findIndex((line) => DATE_RANGE_RE.test(line));
  if (dateIdx === -1) {
    let i = 0;
    let title: string | undefined;
    while (i < lines.length && !BULLET_RE.test(lines[i])) {
      const stripped = lines[i].trim();
      i += 1;
      if (stripped) {
        if (stripped.split(/\s+/).length <= 10) title = stripped;
        break;
      }
    }
    let subtitle: string | undefined;
    if (isSubtitleLine(lines[i])) {
      subtitle = lines[i].trim();
      i += 1;
    }
    return { title, subtitle, descLines: lines.slice(i) };
  }

  const used = new Set<number>([dateIdx]);
  const title = stripDateRange(lines[dateIdx]) || undefined;
  let subtitle: string | undefined;
  if (isSubtitleLine(lines[dateIdx - 1])) {
    subtitle = lines[dateIdx - 1].trim();
    used.add(dateIdx - 1);
  } else if (isSubtitleLine(lines[dateIdx + 1])) {
    subtitle = lines[dateIdx + 1].trim();
    used.add(dateIdx + 1);
  }
  return {
    title,
    subtitle,
    descLines: lines.filter((_, idx) => !used.has(idx)),
  };
}

function fillExperienceLike(section: Section, lines: string[]): void {
  const titleKey = section.type === "organizations" ? "role" : "title";
  const companyKey =
    section.type === "organizations" ? "organization" : "company";
  for (const entryLines of splitExperienceEntries(lines)) {
    const entry = createEmptyEntry(section.type);
    const range = findDateRange(entryLines);
    if (range) {
      entry.fields.startDate = plain(range.start);
      entry.fields.endDate = plain(range.end);
    }
    const { title, subtitle, descLines } = extractEntryHeader(entryLines);
    if (title) entry.fields[titleKey] = plain(title);
    if (subtitle) entry.fields[companyKey] = plain(subtitle);
    entry.fields.description = richFromLines(descLines);
    section.entries.push(entry);
  }
}

function fillEducation(section: Section, lines: string[]): void {
  for (const entryLines of splitExperienceEntries(lines)) {
    const entry = createEmptyEntry("education");
    const range = findDateRange(entryLines);
    if (range) {
      entry.fields.startDate = plain(range.start);
      entry.fields.endDate = plain(range.end);
    }
    const { title, subtitle, descLines } = extractEntryHeader(entryLines);
    if (title) entry.fields.degree = plain(title);
    if (subtitle) entry.fields.institution = plain(subtitle);
    entry.fields.details = richFromLines(descLines);
    section.entries.push(entry);
  }
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
  return PROFICIENCY_WORDS.has(word.toLowerCase().replace(/[^a-z]/g, ""));
}

function splitProficiencyPairs(
  text: string,
): Array<{ name: string; level: string }> {
  const cleanName = (words: string[]) =>
    words
      .join(" ")
      .replace(/[\s\-–—:,|•]+$/, "")
      .trim();
  const pairs: Array<{ name: string; level: string }> = [];
  let nameWords: string[] = [];
  for (const word of pipe(text.split(/\s+/), A.reject(S.isEmpty))) {
    if (isProficiency(word) && nameWords.length > 0) {
      pairs.push({
        name: cleanName(nameWords),
        level: word.replace(/[.,;:]+$/, ""),
      });
      nameWords = [];
    } else {
      nameWords.push(word);
    }
  }
  const trailing = cleanName(nameWords);
  if (trailing) pairs.push({ name: trailing, level: "" });
  return pairs;
}

/** Fill a skills or languages section: name/level pairs when proficiency words
 * are present (also un-merging a two-column grid), otherwise a delimited list. */
function fillNamedList(section: Section, lines: string[]): void {
  const text = pipe(
    lines,
    A.map((line) => line.replace(BULLET_RE, "").trim()),
    A.reject(S.isEmpty),
    A.join(" "),
  );

  if (text.split(/\s+/).some(isProficiency)) {
    for (const { name, level } of splitProficiencyPairs(text)) {
      const entry = createEmptyEntry(section.type);
      entry.fields.name = plain(name);
      if (level) entry.fields.level = plain(level);
      section.entries.push(entry);
    }
    return;
  }

  for (const item of splitItems(lines)) {
    const entry = createEmptyEntry(section.type);
    entry.fields.name = plain(item);
    section.entries.push(entry);
  }
}

function fillCertifications(section: Section, lines: string[]): void {
  for (const line of trimmedNonEmpty(lines)) {
    // A URL line is the verification link of the preceding certificate, not a
    // certificate of its own.
    const last = section.entries.at(-1);
    if (URL_RE.test(line) && last) {
      last.fields.url = plain(line);
      continue;
    }
    const entry = createEmptyEntry("certifications");
    entry.fields.name = plain(line.replace(BULLET_RE, ""));
    section.entries.push(entry);
  }
}

function fillBlock(
  resume: Resume,
  heading: HeadingMatch,
  lines: string[],
): void {
  if (heading.type === "custom") {
    const custom = createCustomSection("rich", heading.title);
    custom.entries[0].fields.body = richFromLines(lines);
    resume.sections.push(custom);
    return;
  }
  const section = sectionOfType(resume, heading.type);
  if (!section) return;
  switch (heading.type) {
    case "summary":
      section.entries.push({
        ...createEmptyEntry("summary"),
        fields: { body: richFromLines(lines) },
      });
      break;
    case "experience":
    case "internship":
    case "projects":
    case "organizations":
      fillExperienceLike(section, lines);
      break;
    case "education":
      fillEducation(section, lines);
      break;
    case "certifications":
      fillCertifications(section, lines);
      break;
    case "skills":
    case "languages":
      fillNamedList(section, lines);
      break;
  }
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
function reassembleLines(rawLines: string[]): string[] {
  const result: string[] = [];
  for (const raw of rawLines) {
    const line = raw.trim();
    if (!line) continue;
    const prev = result.at(-1);
    const isContinuation =
      prev !== undefined &&
      !BULLET_RE.test(line) &&
      !DATE_RANGE_RE.test(line) &&
      !isContactLine(line) &&
      !/[.!?:]$/.test(prev) &&
      (/^[a-z]/.test(line) || /[-–—]$/.test(prev));
    if (!isContinuation) {
      result.push(line);
    } else if (/[-–—]$/.test(prev)) {
      result[result.length - 1] = prev.replace(/[-–—]$/, "") + line;
    } else {
      result[result.length - 1] = `${prev} ${line}`;
    }
  }
  return result;
}

interface Block {
  heading: HeadingMatch | null;
  lines: string[];
}

/**
 * Parse extracted résumé text into a structured document. Conservative by
 * design: fills only high-confidence data (contacts, dates, section text),
 * routes unrecognized headings to custom sections, and returns anything it
 * cannot place as leftovers rather than guessing.
 */
export function parseResumeText(text: string, opts: ParseOptions): ParseResult {
  const resume = createEmptyResume(opts.title);
  resume.language = opts.language;
  resume.templateId = opts.templateId;

  const lines = reassembleLines(text.split(/\r?\n/));
  const blocks: Block[] = [{ heading: null, lines: [] }];
  // Everything before the first recognized section is the preamble (name,
  // contacts, location). A custom (all-caps) heading there is really the name,
  // so custom headings are only honored once a recognized section has started.
  let seenRecognizedHeading = false;
  for (const line of lines) {
    let heading = line.trim() ? detectHeading(line) : null;
    if (heading?.type === "custom" && !seenRecognizedHeading) heading = null;
    if (heading) {
      if (heading.type !== "custom") seenRecognizedHeading = true;
      blocks.push({ heading, lines: [] });
    } else {
      blocks[blocks.length - 1].lines.push(line);
    }
  }

  const preamble = blocks[0].heading === null ? blocks[0].lines : [];
  const leftovers = fillHeader(resume, preamble, text);

  for (const block of blocks) {
    if (block.heading) fillBlock(resume, block.heading, block.lines);
  }

  return { resume, leftovers };
}
