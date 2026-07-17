export interface ChangelogEntry {
  version: string;
  date: string;
}

/**
 * Release metadata for the "What's new" sheet, newest first. Each version's
 * highlights live in the `platform.changelog.entries` messages, keyed by version
 * with dots replaced by underscores, as a list of { title, description }.
 */
export const CHANGELOG: ChangelogEntry[] = [
  { version: "0.10.0", date: "2026-07-17" },
  { version: "0.9.0", date: "2026-07-14" },
  { version: "0.8.0", date: "2026-07-11" },
  { version: "0.7.0", date: "2026-07-10" },
  { version: "0.6.0", date: "2026-07-08" },
  { version: "0.5.0", date: "2026-07-06" },
  { version: "0.4.0", date: "2026-07-05" },
  { version: "0.3.0", date: "2026-07-04" },
  { version: "0.2.0", date: "2026-07-03" },
];

export const LATEST_CHANGELOG_VERSION = CHANGELOG[0]?.version ?? "";
