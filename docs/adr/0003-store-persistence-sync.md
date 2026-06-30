# zustand holds one open resume; persist via subscription with two debounce layers

The zustand store holds only the currently-open Resume (full document tree) plus a lightweight Resume index for the list UI — not all resume bodies. Persistence is a single `store.subscribe` that debounces (~500ms) a whole-document write to that resume's IndexedDB record. TipTap fields debounce their own serialize-to-store commit (on delay/blur) rather than dispatching per keystroke. Pending writes flush on `visibilitychange`/`pagehide` and on resume-switch.

## Why

- A subscription that syncs to IndexedDB is the one legitimate external-system effect AGENTS.md allows; a per-action middleware write would thrash IndexedDB and re-render on every keystroke.
- Whole-document writes (resumes are KB-scale) avoid field-level diffing complexity.
- Two debounce layers (TipTap→store, store→IndexedDB) keep keystrokes from re-rendering the world, at the cost of up to ~1s of in-flight unsaved edits — bounded by the flush-on-hide safety net.

## Consequences

- Switching resumes must flush-then-hydrate to avoid cross-document writes.
- Worst-case data loss on a hard crash is one debounce window; acceptable for a local single-user tool.
