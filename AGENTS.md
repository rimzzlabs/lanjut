<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# AGENTS.md

## Lanjut -> Resume -> Résumé.

An ATS Builder. Free, Open-Source, local-first resume builder. Customizable presentation layer, constrained structural layer for ATS parseability.

## Tech Stack

- Next.js (App Router)
- open-next on Cloudflare (hosting only; the sole server surface is the `/api/feedback` route, which relays bug reports and feature requests and never receives resume content)
- next-intl (internationalization; `[locale]` routing for English and Indonesian, `messages/*.json`, edge middleware)
- shadcn (base-ui variant)
- Tailwind CSS
- [TipTap](https://tiptap.dev/docs) (rich text editing, restricted extension set)
- react-hook-form + zod + @hookform/resolvers (forms; every field goes through Controller, schemas in `src/lib/forms`)
- @dnd-kit (section and entry drag-to-reorder)
- @react-pdf/renderer and docx (PDF and .docx export)
- nextstepjs (guided tour)
- motion/react (animation)
- zustand (in-memory state)
- IndexedDB via idb (persistence layer)
- date-fns
- @mobily/ts-belt (general utilities)
- Biome (lint and format; not Prettier or ESLint)
- commitlint + commitizen (commit message enforcement)
- husky + lint-staged (pre-commit hooks)
- nuqs (search params state)

@mobily/ts-belt is the single utility library. Do not introduce radash or any second utility library with overlapping purpose.

## Architecture Rule: Two Layers

1. Structural layer. Fixed section types (header, summary, experience, internship, projects, organizations, education, certifications, skills, languages, plus custom sections from an approved variant list). The canonical type order and per-type field schemas live in `src/lib/resume/schema-registry.ts`. Each field has a restricted TipTap schema: bold, italic, bullet list, ordered list, link. No tables, no multi-column layout, no text boxes, no inline images, no custom heading levels beyond what the section template defines.

2. Presentation layer. Typography, spacing, color, accent styles, section visual ordering. Fully customizable. Must never alter the underlying linear text structure used for parsing or export.

Any feature request that adds structural freedom (tables, columns, floating elements, decorative icons in text runs) is out of scope unless it is presentation-only and degrades gracefully to plain text in export.

## Data and Storage


- zustand holds working state, synced to IndexedDB on change (debounced).
- No resume content is sent to any server, API route, or open-next function. Confirm this on every PR touching data flow.
- Document shape is versioned by the in-document `schemaVersion` plus a forward-only, read-time migration ladder (`src/lib/resume/migrations.ts`). Ship the shape change, the `CURRENT_SCHEMA_VERSION` bump, and the ladder rung in the same PR. Full reference: `docs/schema-migrations.md`.
- The IndexedDB `DB_VERSION` is separate and governs object stores/indexes only. Never bump it for a field-shape change; never reshape documents inside the idb `upgrade` callback.
- Migration steps must be bail-safe: when a document does not match the expected shape, keep the original data and no-op; never blank or replace what cannot be parsed.
- Raw pre-migration documents are snapshotted to the `backups` object store before migration. Documents that fail migration are surfaced as unreadable in the UI and are never deleted or overwritten.


## Reordering

- Section reordering (drag-to-reorder via @dnd-kit, `reorderSections` in the store) changes ordering metadata only. It does not alter content schema. Summary is pinned below the Header and does not participate; every other section type is reorderable (`REORDERABLE_SECTION_TYPES` in `src/lib/resume/schema-registry.ts`). Entries within a section are not manually reordered; they sort by date.

## Export

- PDF export must preserve linear reading order. Do not use a method that achieves visual layout via absolute positioning that breaks text extraction order. Verify with a text-extraction test (e.g., pdftotext) after any change to the PDF generation path.
- Provide a plain text or .docx export path in addition to PDF. This is the actual ATS-safe submission format for many applicant tracking systems.
- Before marking export work done, run output through at least one real parser test (Workday/Greenhouse test upload, or an open-source resume parser) and confirm fields map correctly.
- Entry blocks (experience, education, certificate, and the internship/projects/organizations and custom `list` sections that reuse the experience kind) must never split across a page break; their title, subtitle, and body stay on one page, matching the on-screen paginator which never splits a block. `isAtomicBlock` in `src/components/editor/resume-blocks.ts` is the source of truth; every PDF template's block wrapper sets `wrap={isAtomicBlock(block) ? false : undefined}`. A new PDF template MUST do the same, or its entries will orphan their header at a page foot. Apply `wrap={false}` only at the whole-entry level, never on the individual bullet rows in `pdf-rich-text.tsx` (that collapses list items on top of each other at a page boundary).

## Documentation

- Docs are part of the change, not a follow-up. Before opening a PR, check whether the change makes any of these stale and update the affected ones in the same PR:
  - `README.md`: user-facing features, template list, tech stack table, scripts.
  - `AGENTS.md`: tech stack, section types, architecture rules, conventions.
  - `design.md`: design system, tokens, routes, page-type families.
  - `docs/schema-migrations.md`: any document-shape or `DB_VERSION` change.
  - `docs/export-validation.md`: any change to the PDF/docx/txt export path.
- Common triggers: adding or removing a dependency (tech stack lists), a new section type or field shape (section-type lists), a new user-facing capability (README features), a new script (scripts tables), a new route or server surface (`design.md`, the data-flow rule).
- Verify every documented claim against the code before writing it. Describe what ships, not intended behavior. A doc that overstates the product is worse than a missing line.

## Commits

- Use commitizen format via commitlint config. Do not bypass with --no-verify.
- husky pre-commit runs lint-staged. Do not commit with failing lint or format checks.

## Build Order (do not reorder without reason)

1. Resume data schema + IndexedDB layer
2. zustand store wired to persistence
3. TipTap fields with restricted schemas
4. Presentation layer (themes, typography, spacing)
5. Export pipeline (PDF, then docx/txt)
6. Parser validation pass

## Non-Goals

- No backend account system. No server-side storage of resume content.
- No structural customization that compromises ATS parseability, regardless of how the request is framed (templates, themes, layouts).
- No second utility library duplicating @mobily/ts-belt.

## Code Conventions

- TypeScript strict mode on.
- No `any` without inline justification comment.
- Components live in `./src/components/<domain-name>/*`, grouped by their domain (e.g. `./src/components/landing/landing-hero.tsx`). Never a global `components/` dump by type, and never colocated under `src/app/` route folders.
- Shared non-primitive components (used across domains, but not base UI primitives) live in `./src/components/shared/*`.
- Shared UI primitives only in the shadcn-managed `./src/components/ui` directory.
- Compose the existing primitives in `./src/components/ui`; do not hand-roll their equivalents. A callout or notice is an `Alert`, a scrollable region is a `ScrollArea`, and so on. Never reach for raw markup (a bare `<p>` plus link) or a native `overflow-y-auto` when a primitive already covers it. Note: base-ui's `ScrollArea` only scrolls when its Root has a definite height (an explicit height, or a grid track); a `flex-1` used size is not enough.
- No comments restating what code does. Comment only on complex logic where intent is not recoverable from reading the code (e.g., a non-obvious mathematical computation, a workaround for a library bug, a non-standard algorithm).
- Do not reach for `useEffect` as a default tool for state synchronization, computed values, or event response. Before adding a `useEffect`, check whether the case matches one of the patterns in https://react.dev/learn/you-might-not-need-an-effect. Valid `useEffect` use is limited to synchronizing with an external system (IndexedDB writes, subscriptions, third-party widget instances). Derived state belongs in render or in zustand selectors, not in an effect that copies state into state.
- Separate components by concern. A list is not one component. Split into list container, list item, and item-internal pieces as separate components, each in its own file or clearly separated block. Do not collapse a list and its item rendering logic into a single component body.
- Props destructuring is capped at 3 fields. If a component needs more than 3 fields from props, do not destructure, access fields directly via `props.fieldName`. This applies above the 3-field threshold only, not below it.
- No default exports for function components or utility functions. All exports are named.
- Prefer named function declarations (`function ComponentName(props) {}`) over arrow function assignments (`const ComponentName = (props) => {}`) for components and standalone functions. Arrow functions are permitted only for inline functions defined inside JSX (event handlers, render callbacks passed as props).
