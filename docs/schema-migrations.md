# Schema versioning and migrations

How résumé documents survive schema changes without losing user data. This is
the canonical reference for the two version numbers, the migration ladder, the
pre-migration backup store, and what the UI does when a document can't be read.

## Two versions, two jobs

| Version | Lives in | Governs | Bump when |
| --- | --- | --- | --- |
| `DB_VERSION` (`src/lib/db/schema.ts`) | The IndexedDB database | Object stores and indexes only | Adding or changing a store or index |
| `schemaVersion` (`src/lib/resume/types.ts`, `CURRENT_SCHEMA_VERSION`) | Each persisted document | The field shape of a résumé | Any persisted field-shape change |

Never bump `DB_VERSION` for a field-shape change, and never reshape documents
inside idb's `upgrade` callback. The `upgrade` callback only creates stores
guarded by `objectStoreNames.contains`, so opening the database can never drop
existing data.

## The migration ladder

`src/lib/resume/migrations.ts` holds one forward-only step per version, keyed by
the version it migrates *from* (`LADDER[N]: vN → vN+1`). `runMigrations` walks a
document up the ladder at **read time, in memory**; the raw document on disk is
untouched until the user's next edit persists the migrated shape.

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

Documents with a `schemaVersion` **newer** than the running app (a stale cached
bundle or a long-lived old tab after a deploy) fail migration with an error.
That is deliberate: there is no forward compatibility, and guessing would risk
writing a downgraded document over a newer one.

## Pre-migration backups

Before the repository (`src/lib/db/resume.ts`) migrates a document, it snapshots
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
