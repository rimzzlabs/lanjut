import { A, O, pipe, S } from "@mobily/ts-belt";
import {
  createEmptyEntry,
  type Entry,
  type FieldKey,
  type SectionType,
} from "@/lib/resume";
import {
  DATE_RANGE_RE,
  findDateRange,
  stripDateRange,
} from "./parse-entry-split";
import type { Fields } from "./parse-header";
import { BULLET_RE, plain, richFromLines } from "./parse-rich-lines";

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

export function plainIfPresent(
  key: FieldKey,
  value: string | undefined,
): Fields {
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

export function datedEntry(type: SectionType, keys: DatedKeys) {
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

export function experienceKeys(type: SectionType): DatedKeys {
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

export const EDUCATION_KEYS: DatedKeys = {
  title: "degree",
  subject: "institution",
  body: "details",
  withLocation: true,
};
