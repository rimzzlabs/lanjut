# Schema versioning and migrations

How résumé documents survive schema changes without losing user data. This is
the canonical reference for the two version numbers, the migration ladder, the
pre-migration backup store, and what the UI does when a document can't be read.

## Two versions, two jobs

| Version                                                                    | Lives in                | Governs                        | Bump when                           |
| -------------------------------------------------------------------------- | ----------------------- | ------------------------------ | ----------------------------------- |
| `DB_VERSION` (`packages/resume/src/db/schema.ts`)                          | The IndexedDB database  | Object stores and indexes only | Adding or changing a store or index |
| `schemaVersion` (`packages/resume/src/types.ts`, `CURRENT_SCHEMA_VERSION`) | Each persisted document | The field shape of a résumé    | Any persisted field-shape change    |

Never bump `DB_VERSION` for a field-shape change, and never reshape documents
inside idb's `upgrade` callback. Version 4 adds the `profiles` store, which holds
the pre-fill profiles. A profile's `header` has the résumé header's shape and is
not versioned, so a step that changes `HEADER_SCHEMA` must also carry the saved
profiles across. The `upgrade` callback only creates stores
guarded by `objectStoreNames.contains`, so opening the database can never drop
existing data.

### Open tabs during a `DB_VERSION` bump

The browser runs the `upgrade` callback only after every connection on the old
version closes. A tab still running an older build keeps its connection open,
so a new tab waits. While it waits, `getDb` emits `DB_BLOCKED` on `DB_EVENTS`,
and the app shows a notice that asks the person to close the other tab
(`PlatformDatabaseNotice`). The notice goes away by itself on `DB_READY`.

From `DB_VERSION` 4 on, a tab gives up its own connection when a newer build
asks for it (idb's `blocking` callback), then emits `DB_OUTDATED`, and the app
asks the person to refresh. Builds before version 4 have no such handler, so
for the 3 to 4 bump the notice in the new tab is the only help.

## The migration ladder

`packages/resume/src/migrations.ts` holds the ladder: one forward-only step per
version, keyed by the version it migrates _from_ (`LADDER[N]: vN → vN+1`).
`runMigrations` walks a document up the ladder at **read time, in memory**; the
raw document on disk is untouched until the user's next edit persists the
migrated shape.

The steps live beside it. `migrations-v1-v11.ts` and `migrations-v11-v25.ts` hold
the steps by version range, and `migrations-shared.ts` holds the document type
and the helpers they share. Write a new step in the newest range file, or start
a new range file when that one passes 600 lines, then add it to `LADDER`.

Rules for every step:

- **Pure.** A JSON→JSON function over a plain document. No IndexedDB access, no
  app state.
- **Bail-safe.** If the document doesn't match the shape the step expects
  (e.g. a mis-stamped `schemaVersion`, or a doc written by an in-progress dev
  build), the step must leave the existing data untouched and degrade to a
  no-op. It must never blank fields or replace entries it can't parse. The
  first write after a migration persists the migrated document over the
  original; a lossy step destroys data permanently at that moment.
- **Shipped atomically.** The field-shape change, the `CURRENT_SCHEMA_VERSION`
  bump, and the ladder rung land in the same PR. A shipped gap in the ladder
  makes every older document unreadable.

The current v24→v25 rung stamps the version for the optional `profileId`, the
profile a résumé belongs to. It reshapes nothing: a résumé without `profileId`
belongs to the first profile, which the app resolves at read time. The field is
organization only, so it never renders and the JSON and YAML interchange leaves
it out.

Documents with a `schemaVersion` **newer** than the running app (a stale cached
bundle or a long-lived old tab after a deploy) fail migration with an error.
That is deliberate: there is no forward compatibility, and guessing would risk
writing a downgraded document over a newer one.

## Pre-migration backups

Before the repository (`packages/resume/src/db/resume.ts`) migrates a document, it snapshots
the raw pre-migration form into the `backups` object store, keyed by
`${resumeId}@v${schemaVersion}`, one snapshot per document per ladder crossing.
This happens on read, before the migrated shape has any chance of being
persisted, so a buggy ladder step is always recoverable.

To recover: DevTools → Application → IndexedDB → `lanjut` → `backups`, copy the
`doc` value for the affected id/version, and restore it into the `resumes`
store (the app will re-migrate it on the next read).

## Failure handling in the UI

Migration failures are isolated per document and **nothing is ever deleted**:

- `listResumeIndex` migrates each document in its own try/catch. Unreadable
  documents are counted (`unreadableCount`), not dropped from disk, and one bad
  document cannot empty the whole Library.
- The Library shows a notice ("saved by a newer version, refresh to update")
  when `unreadableCount > 0`, and the empty state is suppressed so the user is
  never told they have no résumés while unreadable ones exist.
- Opening an unreadable document resolves to the `missing` state instead of a
  stuck loading state.
- A total index failure (storage itself unreadable) sets `indexStatus` to
  `error` and renders an explicit error message instead of an endless skeleton.
