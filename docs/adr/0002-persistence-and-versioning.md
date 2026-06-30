# Multi-resume persistence with two-tier versioning

Resumes persist in IndexedDB (via `idb`) as multiple documents from day one: a `resumes` object store keyed by `id`, plus a small `app`/`meta` store for pointers like `lastOpenedResumeId`. Document field-shape changes are versioned by an in-document integer `schemaVersion` and migrated by a forward-only ladder of pure functions run at **read time**, per document. The IndexedDB DB version is reserved for object-store/index structure only.

## Why

- **Multi from day one**: tailoring a résumé per job posting is core to the ATS use case; retrofitting multi-document storage later is a painful migration. Designing the store for many costs nothing now.
- **Two separate version numbers**: document shape changes far more often than store structure. Conflating them (migrating in `idb`'s `onupgradeneeded`) forces a DB-version bump for every field tweak, runs against raw cursors, and resists unit testing. Keeping `schemaVersion` inside the document lets migrations be pure JSON→JSON functions, tested with fixtures, run lazily on read.

## Consequences

- Every field-shape change requires a new ladder step + a fixture test. Enforced by review, not the compiler.
- Migrated documents are written back on the next debounced save (or eagerly post-migration).
- No resume content ever leaves the browser; this is the only persistence tier.
