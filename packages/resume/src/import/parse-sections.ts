import { A, G, pipe, S } from "@mobily/ts-belt";
import {
  createCustomSection,
  createEmptyEntry,
  type Entry,
  type Resume,
  type Section,
  updateSectionOfType,
  updateSections,
} from "..";
import type { HeadingMatch } from "./headings";
import {
  datedEntry,
  EDUCATION_KEYS,
  experienceKeys,
  plainIfPresent,
} from "./parse-entry-fields";
import { splitExperienceEntries, splitItems } from "./parse-entry-split";
import { URL_RE } from "./parse-header";
import {
  BULLET_RE,
  plain,
  richFromLines,
  trimmedNonEmpty,
} from "./parse-rich-lines";

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

export function fillBlock(resume: Resume, block: Block): Resume {
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

export interface Block {
  heading: HeadingMatch | null;
  lines: ReadonlyArray<string>;
}
