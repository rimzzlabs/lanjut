import { A, G, pipe, S } from "@mobily/ts-belt";
import {
  isSampleEntry,
  isSampleLine,
  ownHeaderValue,
  ownListNames,
  plainOf,
  richLines,
} from "./readiness-sample";
import type { Entry, Resume, Section, SectionType } from "./types";

export type ReadinessCheckId =
  | "name"
  | "jobTitle"
  | "email"
  | "phone"
  | "location"
  | "summary"
  | "experience"
  | "bullets"
  | "education"
  | "skills";

/** Where a check is fixed: a section of the editor list, and a field in it. */
export interface ReadinessTarget {
  /** The section's value in the editor list: "personal", or a section type. */
  section: "personal" | SectionType;
  field?: string;
}

export interface ReadinessCheck {
  id: ReadinessCheckId;
  done: boolean;
  target: ReadinessTarget;
}

export interface Readiness {
  /** The share of checks done, from 0 to 100. */
  percent: number;
  checks: ReadonlyArray<ReadinessCheck>;
}

export const SUMMARY_MIN_WORDS = 15;
export const BULLETS_MIN = 3;
export const SKILLS_MIN = 5;
// A bullet shorter than this is a stub, not a line about the work.
const BULLET_MIN_WORDS = 3;

const JOB_TYPES: ReadonlyArray<SectionType> = ["experience", "internship"];
const WORK_TYPES: ReadonlyArray<SectionType> = [
  "experience",
  "internship",
  "projects",
  "organizations",
];

function wordCount(text: string): number {
  return pipe(
    text,
    S.splitByRe(/\s+/),
    A.filter(G.isString),
    A.reject(S.isEmpty),
    A.length,
  );
}

function shown(
  resume: Resume,
  types: ReadonlyArray<SectionType>,
): ReadonlyArray<Section> {
  return A.filter(
    resume.sections,
    (section) => A.includes(types, section.type) && section.hidden !== true,
  );
}

function ownEntries(sections: ReadonlyArray<Section>): ReadonlyArray<Entry> {
  return A.flatMap(sections, (section) =>
    A.reject(section.entries, (entry) => isSampleEntry(section.type, entry)),
  );
}

function ownLines(sections: ReadonlyArray<Section>): ReadonlyArray<string> {
  return pipe(
    sections,
    A.flatMap((section) => section.entries),
    A.flatMap((entry) => A.flatMap(Object.values(entry.fields), richLines)),
    A.reject(isSampleLine),
  );
}

function hasAny(entry: Entry, keys: ReadonlyArray<string>): boolean {
  return A.some(keys, (key) => S.isNotEmpty(plainOf(entry.fields[key])));
}

function headerCheck(
  resume: Resume,
  id: ReadinessCheckId,
  keys: ReadonlyArray<string>,
): ReadinessCheck {
  return {
    id,
    done: A.some(keys, (key) => S.isNotEmpty(ownHeaderValue(resume, key))),
    target: { section: "personal", field: keys[0] },
  };
}

type SectionCheck = (resume: Resume) => ReadinessCheck | undefined;

// A check on sections that are all hidden or absent drops out: hiding a
// section is a choice, and it never keeps a résumé from being ready.
const SECTION_CHECKS: ReadonlyArray<SectionCheck> = [
  (resume) => {
    const sections = shown(resume, ["summary"]);
    if (A.isEmpty(sections)) return undefined;
    const words = A.reduce(ownLines(sections), 0, (sum, line) => {
      return sum + wordCount(line);
    });
    return {
      id: "summary",
      done: words >= SUMMARY_MIN_WORDS,
      target: { section: "summary" },
    };
  },
  (resume) => {
    const sections = shown(resume, JOB_TYPES);
    if (A.isEmpty(sections)) return undefined;
    return {
      id: "experience",
      done: A.some(
        ownEntries(sections),
        (entry) =>
          hasAny(entry, ["title", "company"]) && hasAny(entry, ["startDate"]),
      ),
      target: { section: "experience" },
    };
  },
  (resume) => {
    const sections = shown(resume, WORK_TYPES);
    if (A.isEmpty(sections)) return undefined;
    const bullets = A.filter(
      ownLines(sections),
      (line) => wordCount(line) >= BULLET_MIN_WORDS,
    );
    return {
      id: "bullets",
      done: A.length(bullets) >= BULLETS_MIN,
      target: { section: "experience" },
    };
  },
  (resume) => {
    const sections = shown(resume, ["education"]);
    if (A.isEmpty(sections)) return undefined;
    return {
      id: "education",
      done: A.some(ownEntries(sections), (entry) =>
        hasAny(entry, ["degree", "institution"]),
      ),
      target: { section: "education" },
    };
  },
  (resume) => {
    const sections = shown(resume, ["skills"]);
    if (A.isEmpty(sections)) return undefined;
    const names = A.flatMap(sections, ownListNames);
    return {
      id: "skills",
      done: A.length(names) >= SKILLS_MIN,
      target: { section: "skills" },
    };
  },
];

/**
 * How ready a résumé is to send, as ten checks on what an applicant tracking
 * system and a recruiter look for first. A check passes only on the person's
 * own words: a Blank and a Sample start both begin at 0%, and the sample's
 * text counts for nothing until it is replaced. Computed from the document,
 * so nothing is stored.
 */
export function measureReadiness(resume: Resume): Readiness {
  const checks = A.concat(
    [
      headerCheck(resume, "name", ["firstName", "lastName"]),
      headerCheck(resume, "jobTitle", ["jobTitle"]),
      headerCheck(resume, "email", ["email"]),
      headerCheck(resume, "phone", ["phone"]),
      headerCheck(resume, "location", ["city", "province", "country"]),
    ],
    A.filterMap(SECTION_CHECKS, (check) => check(resume)),
  );
  const done = A.length(A.filter(checks, (check) => check.done));
  return {
    percent: Math.round((done / A.length(checks)) * 100),
    checks,
  };
}

/** A section's state in the editor list: done, to do, or nothing to check. */
export function sectionReadiness(
  readiness: Readiness,
  section: string,
): "done" | "todo" | undefined {
  const checks = A.filter(
    readiness.checks,
    (check) => check.target.section === section,
  );
  if (A.isEmpty(checks)) return undefined;
  if (A.every(checks, (check) => check.done)) return "done";
  return "todo";
}
