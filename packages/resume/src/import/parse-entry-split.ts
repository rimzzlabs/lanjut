import { A, G, O, pipe, S } from "@mobily/ts-belt";
import { BULLET_RE, isLinkLine } from "./parse-rich-lines";

// --- sections --------------------------------------------------------------

const MONTH =
  "(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|januari|februari|maret|april|mei|juni|juli|agustus|september|oktober|november|desember)[a-z]*\\.?";
const DATE_TOKEN = `(?:${MONTH}\\s*)?\\d{4}`;
const DATE_END = `(?:${DATE_TOKEN}|present|sekarang|current|now|kini)`;
export const DATE_RANGE_RE = new RegExp(
  `(${DATE_TOKEN})\\s*[-–—]{1,2}\\s*(${DATE_END})`,
  "i",
);

export function findDateRange(
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
  if (isLinkLine(trimmed)) return false;
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

export function splitExperienceEntries(
  lines: ReadonlyArray<string>,
): EntryLines {
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

export function splitItems(lines: ReadonlyArray<string>): readonly string[] {
  return pipe(
    lines,
    A.flatMap(S.splitByRe(/[,;•·|]/)),
    A.filter(G.isString),
    A.map(S.replaceByRe(BULLET_RE, "")),
    A.map(S.trim),
    A.reject(S.isEmpty),
  );
}

export function stripDateRange(line: string): string {
  return pipe(
    line,
    S.replaceByRe(DATE_RANGE_RE, ""),
    S.replaceByRe(/^[\s|,·•–—-]+|[\s|,·•–—-]+$/g, ""),
    S.trim,
  );
}
