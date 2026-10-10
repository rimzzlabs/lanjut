import { A, O, pipe, S } from "@mobily/ts-belt";
import { REPO_URL } from "./site";

export interface ChangelogEntry {
  version: string;
  date: string;
}

export interface ChangelogHighlight {
  title: string;
  description: string;
}

/**
 * Release metadata for the changelog page, newest first. Each version's
 * highlights live in the `platform.changelog.entries` messages, keyed by version
 * with dots replaced by underscores, as a list of { title, description }.
 */
export const CHANGELOG: ReadonlyArray<ChangelogEntry> = [
  { version: "0.23.0", date: "2026-10-11" },
  { version: "0.22.0", date: "2026-10-11" },
  { version: "0.21.3", date: "2026-10-11" },
  { version: "0.21.2", date: "2026-10-11" },
  { version: "0.21.1", date: "2026-10-10" },
  { version: "0.21.0", date: "2026-10-10" },
  { version: "0.20.3", date: "2026-10-09" },
  { version: "0.20.2", date: "2026-10-09" },
  { version: "0.20.1", date: "2026-10-09" },
  { version: "0.20.0", date: "2026-10-09" },
  { version: "0.19.1", date: "2026-10-09" },
  { version: "0.19.0", date: "2026-10-09" },
  { version: "0.18.0", date: "2026-09-27" },
  { version: "0.17.2", date: "2026-09-19" },
  { version: "0.17.1", date: "2026-09-12" },
  { version: "0.17.0", date: "2026-09-11" },
  { version: "0.16.2", date: "2026-09-11" },
  { version: "0.16.1", date: "2026-09-11" },
  { version: "0.16.0", date: "2026-09-11" },
  { version: "0.15.0", date: "2026-09-11" },
  { version: "0.14.0", date: "2026-09-06" },
  { version: "0.13.0", date: "2026-09-06" },
  { version: "0.12.0", date: "2026-09-02" },
  { version: "0.11.0", date: "2026-08-02" },
  { version: "0.10.2", date: "2026-07-20" },
  { version: "0.10.1", date: "2026-07-19" },
  { version: "0.10.0", date: "2026-07-19" },
  { version: "0.9.3", date: "2026-07-17" },
  { version: "0.9.2", date: "2026-07-14" },
  { version: "0.9.1", date: "2026-07-14" },
  { version: "0.9.0", date: "2026-07-14" },
  { version: "0.8.0", date: "2026-07-11" },
  { version: "0.7.0", date: "2026-07-10" },
  { version: "0.6.0", date: "2026-07-08" },
  { version: "0.5.0", date: "2026-07-06" },
  { version: "0.4.1", date: "2026-07-05" },
  { version: "0.4.0", date: "2026-07-05" },
  { version: "0.3.1", date: "2026-07-04" },
  { version: "0.3.0", date: "2026-07-04" },
  { version: "0.2.0", date: "2026-07-03" },
];

export const LATEST_CHANGELOG_VERSION = pipe(
  CHANGELOG,
  A.head,
  O.mapWithDefault("", (entry) => entry.version),
);

/** The messages key of a version's highlights: `0.19.0` is `0_19_0`. */
export function changelogMessageKey(version: string): string {
  return S.replaceByRe(version, /\./g, "_");
}

/** The fragment id of a version on the changelog page: `0.19.0` is `v0-19-0`. */
export function changelogAnchor(version: string): string {
  return `v${S.replaceByRe(version, /\./g, "-")}`;
}

/** The GitHub release of a version. */
export function changelogReleaseUrl(version: string): string {
  return `${REPO_URL}/releases/tag/v${version}`;
}

/**
 * Release dates are calendar days, so they format in UTC. The build and every
 * visitor then print the same day.
 */
export const CHANGELOG_DATE_FORMAT = {
  year: "numeric",
  month: "long",
  day: "numeric",
  timeZone: "UTC",
} as const;
