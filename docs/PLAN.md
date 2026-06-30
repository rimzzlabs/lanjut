# Lanjut — Build Plan

Phases are demoable milestones; increments are vertical slices within them. Ordering honors the AGENTS.md build order (schema → store → editor → dnd → presentation → export → parser gate). Design decisions behind this plan are recorded as ADRs in [docs/adr/](./adr/); domain vocabulary lives in [CONTEXT.md](../CONTEXT.md).

## Phase 0 — Foundations
_Verifiable in isolation; not yet user-visible._

- **0.1** Domain types (`Resume`, `Header`, `Section`, `Entry`, `Field`) + Section schema registry (core four: summary, experience, education, skills; plus the free-form custom type) + the Seed fixture ("John Doe"). See ADR-0001.
- **0.2** Migration ladder harness: in-document `schemaVersion`, read-time `runMigrations`, fixture test. Exists from v1 even with a single version. See ADR-0002.
- **0.3** IndexedDB layer via `idb`: `resumes` store (keyed by id) + `app` store (`lastOpenedResumeId`), CRUD, flush primitives. DB version governs store structure only. See ADR-0002.

## Phase 1 — Editable resume, persisted
_The walking skeleton: create → fill → reload restores. First usable product._

- **1.1** zustand store: single open Resume + Resume index; hydrate/flush; `subscribe`→debounced whole-document persist; flush on `visibilitychange`/`pagehide`. See ADR-0003.
- **1.2** Library (`/`): create (seeds the Seed fixture), open, rename, duplicate, delete.
- **1.3** Editor shell (`/r/[id]`): resolve id → hydrate (unknown id → Library), render Header + Sections, plain-input Fields editable, reload restores.
- **1.4** TipTap richtext Fields: per-field instance, Restricted schema allowlist, paste filtering, debounced commit to store. v1 mounts a live editor per visible richtext field. See ADR-0004.

## Phase 1.5 — Export de-risking spike
_Thin proof, not the full pipeline._

- Minimal `@react-pdf` PDF of the seeded Resume (no presentation, no preview UI, no DOCX). Assert `pdftotext` yields clean linear text from the document model. Validates the load-bearing assumption (ADR-0005) before presentation is built on top of it.

## Phase 2 — Structure control
- **2.1** Section reordering via dnd-kit (sortable over `sections[]`; array-position ordering).
- **2.2** Entry reordering within a Section (sortable over `entries[]`).
- **2.3** Add/remove Sections (incl. free-form custom), add/remove Entries, Section title rename.

## Phase 3 — Presentation
- **3.1** Presentation token model + `presentation` block + migration step + default Theme. See ADR-0006.
- **3.2** Code-defined Theme presets + picker; tokens applied to the editing canvas.
- **3.3** Constrained customization panel (fontFamily, fontScale, density, accentColor, headingStyle, page size/margins). No custom CSS, no per-element overrides.

## Phase 4 — Export pipeline
- **4.1** TXT Exporter — establishes the pure-function model-walk pattern.
- **4.2** PDF Exporter via `@react-pdf` (font registration, token mapping, reading order); Export preview panel renders the real Exporter; download.
- **4.3** DOCX Exporter via `docx`.
- **4.4** Parser gate (CI: all Exporters on the Seed fixture, `pdftotext` + string-order assertions) + export-time sample guard. See ADR-0005.

## Phase 5 — Hardening & deferred
Curated custom-section catalog (tier 2); user-facing ATS check; service worker / installable PWA; open-next on Cloudflare deploy config; document-level undo/redo; blank-resume creation option; user-saved custom themes.

## Deferred decisions (not yet designed)
- Resume import / parsing an existing file.
- Document-level undo/redo mechanism.
- Multi-page break behavior in PDF beyond `@react-pdf` defaults.
