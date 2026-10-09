import { A, pipe, S } from "@mobily/ts-belt";
import {
  type InlineRun,
  type RichBlock,
  tiptapToRichBlocks,
} from "./rich-content";
import { SEED_RESUME } from "./seed";
import type { Entry, Field, Resume, Section, SectionType } from "./types";

/**
 * Tells the sample's text from the person's own. A short value such as
 * "Software Engineer" or "United States" can be both, so a value counts as
 * the sample's only while its group still is: the header while it holds the
 * sample's name or email, an entry while its title and subject match a sample
 * entry, a list while most of it is the sample's. A paragraph or bullet is
 * long enough to compare on its own.
 */

export function normalize(text: string): string {
  return pipe(text, S.toLowerCase, S.replaceByRe(/\s+/g, " "), S.trim);
}

export function plainOf(field: Field | undefined): string {
  if (field?.kind !== "plain") return "";
  return S.trim(field.value);
}

function runsText(runs: ReadonlyArray<InlineRun>): string {
  return pipe(
    runs,
    A.map((run) => run.text),
    A.join(""),
    S.trim,
  );
}

function blockLines(block: RichBlock): ReadonlyArray<string> {
  if (block.type === "paragraph") return [runsText(block.runs)];
  return A.map(block.items, runsText);
}

/** Each paragraph and list item of a rich field, as plain text. */
export function richLines(field: Field | undefined): ReadonlyArray<string> {
  if (field?.kind !== "richtext") return [];
  return pipe(
    tiptapToRichBlocks(field.value),
    A.flatMap(blockLines),
    A.reject(S.isEmpty),
  );
}

const SEED_HEADER = SEED_RESUME.header.fields;

function seedSections(type: SectionType): ReadonlyArray<Section> {
  return A.filter(SEED_RESUME.sections, (section) => section.type === type);
}

function seedEntries(type: SectionType): ReadonlyArray<Entry> {
  return A.flatMap(seedSections(type), (section) => section.entries);
}

const SAMPLE_LINES: ReadonlySet<string> = new Set(
  pipe(
    SEED_RESUME.sections,
    A.flatMap((section) => section.entries),
    A.flatMap((entry) => A.flatMap(Object.values(entry.fields), richLines)),
    A.map(normalize),
  ),
);

export function isSampleLine(line: string): boolean {
  return SAMPLE_LINES.has(normalize(line));
}

function sameValue(
  fields: Record<string, Field>,
  seed: Record<string, Field>,
  key: string,
): boolean {
  const value = normalize(plainOf(fields[key]));
  return S.isNotEmpty(value) && value === normalize(plainOf(seed[key]));
}

/** Whether the header still holds the sample's name or email. */
function isSampleHeader(resume: Resume): boolean {
  const fields = resume.header.fields;
  return (
    sameValue(fields, SEED_HEADER, "email") ||
    (sameValue(fields, SEED_HEADER, "firstName") &&
      sameValue(fields, SEED_HEADER, "lastName"))
  );
}

/** A header value the person wrote, or "" for an empty or sample value. */
export function ownHeaderValue(resume: Resume, key: string): string {
  const fields = resume.header.fields;
  const value = plainOf(fields[key]);
  if (isSampleHeader(resume) && sameValue(fields, SEED_HEADER, key)) return "";
  return value;
}

// The fields that name an entry: its title, and where it happened.
const IDENTITY_KEYS: Partial<Record<SectionType, readonly [string, string]>> = {
  experience: ["title", "company"],
  internship: ["title", "company"],
  projects: ["title", "company"],
  organizations: ["role", "organization"],
  education: ["degree", "institution"],
};

/** Whether an entry is still one of the sample's, by its title and subject. */
export function isSampleEntry(type: SectionType, entry: Entry): boolean {
  const keys = IDENTITY_KEYS[type];
  if (keys === undefined) return false;
  const [title, subject] = keys;
  return A.some(
    seedEntries(type),
    (seed) =>
      sameValue(entry.fields, seed.fields, title) &&
      sameValue(entry.fields, seed.fields, subject),
  );
}

/**
 * The names of a skills or languages list that the person wrote. While the
 * list keeps at least half of the sample's names, only the names the sample
 * does not have count. After that, the list is theirs, shared names included.
 */
export function ownListNames(section: Section): ReadonlyArray<string> {
  const names = pipe(
    section.entries,
    A.map((entry) => plainOf(entry.fields.name)),
    A.reject(S.isEmpty),
  );
  const seedNames = new Set(
    pipe(
      seedEntries(section.type),
      A.map((entry) => normalize(plainOf(entry.fields.name))),
    ),
  );
  const isSeed = (name: string) => seedNames.has(normalize(name));
  const shared = A.length(A.filter(names, isSeed));
  if (shared * 2 < seedNames.size) return names;
  return A.reject(names, isSeed);
}
