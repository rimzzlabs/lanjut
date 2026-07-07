export interface ChangelogEntry {
  version: string;
  date: string;
}

/**
 * Release metadata for the "What's new" sheet, newest first. The per-version
 * highlight text lives in the `platform.changelog.entries` messages, keyed by
 * version with dots replaced by underscores. Add an entry here plus its
 * highlights in both locale files as part of each release PR.
 */
export const CHANGELOG: ChangelogEntry[] = [
  { version: "0.6.0", date: "2026-07-08" },
  { version: "0.5.0", date: "2026-07-06" },
  { version: "0.4.0", date: "2026-07-05" },
  { version: "0.3.0", date: "2026-07-04" },
  { version: "0.2.0", date: "2026-07-03" },
];

export const LATEST_CHANGELOG_VERSION = CHANGELOG[0]?.version ?? "";
