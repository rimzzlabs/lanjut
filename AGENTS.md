# AGENTS.md

## Lanjut -> Resume -> Résumé.

An ATS Builder. Free, Open-Source, local-first resume builder. Customizable presentation layer, constrained structural layer for ATS parseability.

## Repository Layout

A pnpm workspace. Shared tooling (Biome, Prettier, commitlint, lefthook) lives at the root. Each workspace owns its dependencies. A version that more than one workspace uses comes from the `catalog` in `pnpm-workspace.yaml`, so the versions cannot drift apart.

- `apps/web` (`@lanjut/web`): the Astro site, the React app, and the Worker (`worker/`). It builds `dist/` for the web and `dist-desktop/` for the Mac app.
- `apps/desktop` (`@lanjut/desktop`): the Tauri shell in `src-tauri/`. It loads `apps/web/dist-desktop`.
- `packages/resume` (`@lanjut/resume`): the résumé document. It holds the types, the schema registry, the migration ladder, the seed, PDF import, JSON and YAML interchange, the IndexedDB layer, and the template registry. Plain TypeScript with no React.
- `packages/i18n` (`@lanjut/i18n`): the copy (`messages/*.json`) and the routing and translator helpers.
- `packages/ui` (`@lanjut/ui`): the shadcn primitives, the custom primitives that shadcn does not have (`radio-card`), `cn`, and `use-mobile`. Import a primitive as `@lanjut/ui/components/<name>`. Only this package imports `@base-ui/react`.
- `packages/tsconfig` (`@lanjut/tsconfig`): the TypeScript base that the packages extend.

Packages ship TypeScript source, and the app compiles them. A package never imports the app. Inside a package, import its own files by relative path. Across workspaces, import by package name. `apps/web/src/styles/globals.css` lists `packages/ui/src` as a Tailwind `@source`, because Tailwind scans only the app by default.

Run scripts from the repo root. They forward to the workspace that owns them: `pnpm dev`, `pnpm build`, `pnpm desktop:dev`, `pnpm validate:exports`, and `pnpm ui:add <name>`. `pnpm typecheck` checks every workspace.

## Tech Stack

- pnpm workspace (apps and packages, see Repository Layout)
- Astro (static output; every page is prerendered, React islands carry the interactive parts)
- Cloudflare Workers static assets, plus one small Worker in `apps/web/worker/`. The Worker relays bug reports and feature requests on `/api/feedback`, sends visitors to their language, and forwards old addresses. It is the sole server surface and never receives resume content.
- Static desktop build selected by `LANJUT_TARGET=desktop`, written to `apps/web/dist-desktop/`. Tauri packages load only through dynamic imports behind `IS_DESKTOP`, so the web app never runs them.
- Tauri 2 (desktop shell for macOS; `apps/desktop/src-tauri/`, system webview, loads the static export from disk)
- use-intl (internationalization; English at `/` and Indonesian under `/id`, on web and desktop alike. `packages/i18n/messages/*.json` hold the copy. `@lanjut/i18n` holds the routing helpers and `getTranslator` for `.astro` files. `apps/web/src/i18n/navigation.tsx` holds the `Link`, `useRouter`, and `usePathname` replacements)
- shadcn (base-ui primitives, Vega style: 36px controls, `rounded-md` on a `1rem` radius)
- @phosphor-icons/react (icons; `components.json` sets shadcn's `iconLibrary` to `phosphor`, and code imports the `*Icon` names)
- Tailwind CSS
- [TipTap](https://tiptap.dev/docs) (rich text editing, restricted extension set). TipTap is the largest library in the app, so it stays off the first paint: editor forms render the lazy `RichTextField`, never `RichTextEditor` directly, and the platform feedback dialogs load their forms on demand (`platform-feedback-forms.tsx`).
- react-hook-form + zod + @hookform/resolvers (forms; every field goes through Controller, schemas in `apps/web/src/lib/forms`)
- @dnd-kit (section and entry drag-to-reorder)
- takumi-pdf (PDF export: renders the preview's own HTML and compiled CSS to PDF in the browser, through WebAssembly) and docx (.docx export)
- nextstepjs (guided tour; a pnpm patch drops its Next.js wrapper export, and the tour uses `NextStepReact`)
- motion/react (animation)
- zustand (in-memory state)
- IndexedDB via idb (persistence layer)
- date-fns
- @mobily/ts-belt (general utilities)
- Biome (lint and format for code, JSON, and CSS; not ESLint) and Prettier (Markdown and YAML only)
- commitlint + commitizen (commit message enforcement)
- lefthook (git hooks: Biome and Prettier on staged files before a commit, commitlint on the message, `pnpm typecheck` before a push)
- nuqs (per-view search params state)
- wouter (client routing between the app pages, `/editor`, `/template`, and `/profile`)

@mobily/ts-belt is the single utility library. Do not introduce radash or any second utility library with overlapping purpose.

## Pages and Islands

- Pages live in `apps/web/src/pages/[...lang]/` as `.astro` files. `localeStaticPaths` emits each page once per locale.
- An application page renders one React island root: `PlatformApp` at `/editor`, `/template`, and `/profile`, and `FeedbackPage` at `/feedback`. The root wraps its content in `AppProviders`.
- `/editor`, `/template`, and `/profile` load client-only (`client:only="react"`) behind the static `PlatformLoading` fallback. They are not indexed and read everything from IndexedDB, so a server render would add a hydration step and nothing else. `/feedback` still renders on the server.
- Landing sections are `.astro` components in `apps/web/src/components/landing/`. Only the parts that need JavaScript are React islands: the navbar theme toggle and settings menu, the hero's two-readers sheet (the live résumé beside the text a PDF extractor reads back from it), the template picker, the FAQ accordion, and the closing actions. The landing page has its own scoped tokens and faces (`[data-world="readers"]` in `globals.css`, set on `<body>` through the `world` prop of `RootLayout`), so the app keeps its own look. An island that reads copy wraps itself in `IslandProviders`. Static sections take their copy from `getTranslator`.
- Primitives with built-in labels (the Dialog and Sheet close button, `SidebarTrigger`, `Spinner`, `Breadcrumb`) read them from the `ui` messages namespace, so they render only inside an island that wraps `IslandProviders`. `ResumePage` takes its label as a prop instead, because the landing page renders it with no provider.
- Each island is its own React root. React context does not cross islands, so each root carries its own providers. Module state does cross them: islands on one page share the same zustand stores.
- The app pages (`/editor`, `/template`, `/profile`) share one island root, `PlatformApp`. wouter routes between them under a `<Router base>` set to the locale prefix, so the shell stays mounted and only the content swaps. Each content view loads lazily inside its own `Suspense` boundary, whose fallback is a skeleton of that page (`PAGE_SKELETONS` in `platform-app.tsx`), so the full-page `PlatformLoading` fallback shows only on a document load. A page skeleton reuses the loading state that the page shows next (`PlatformLibrarySkeleton`, `EditorPreviewSkeleton`, `EditorSectionListSkeleton`). A skeleton renders for real every part that needs no data (headings, start tiles, toolbars, template names and descriptions), takes the shape the data will give when the store already knows it (the library's résumé count and view), and shows a loading résumé page as `PlatformPaperSkeleton`, white paper with faint lines, never as a grey block. If a page layout changes, change its skeleton in the same PR. `useEditorId` reads the id from wouter's `/editor/:id` route, so every component sees the same location. nuqs keeps only per-view query state (search boxes, the library sort, the chosen template, the chosen profile, the create sheet, feedback params). Those views remount per route, so they read the URL afresh. Every other page change, including a language switch, is a full document load. `Link` and `useRouter` from `@/i18n/navigation` pick the right kind of move through `AppRouterContext`, and flush the pending résumé write first either way. State that must survive a document load lives in IndexedDB or in a zustand `persist` store.
- The shell is the shadcn inset sidebar, collapsible to icons on desktop. The page under the navbar fills a fixed-height grid track: the library and the template page scroll inside `PlatformPageScroll`, and the editor fills the track. The window does not scroll, so code that must move a page to the top calls `scrollPageToTop` from `apps/web/src/lib/page-scroll.ts`, not `window.scrollTo`.
- The workspace lives under `/editor`: `/editor` is the résumé library and `/editor/<id>` opens that résumé in the editor. The templates page is `/template`, and the profiles page is `/profile`. `EDITOR_PATHNAME`, `EDITOR_DOCUMENT_ROUTE`, `TEMPLATE_PATHNAME`, `PROFILE_PATHNAME`, `editorHref`, and `useEditorId` own these addresses, and `useWorkspaceView` says which half of the workspace shows. No file exists per résumé, so every environment answers `/editor/<id>` with the editor page: the Worker fetches that asset and keeps the URL, `astro dev` rewrites the request in a Vite plugin in `astro.config.ts`, and the desktop build's root `index.html` boots the app (see Desktop shell). Older addresses forward in one 301 that keeps the rest of the query: `/platform`, `/platform/template`, `/platform/editor/<id>`, `/platform/editor?id=<id>`, and `/editor?id=<id>`. `legacyTarget` and `appPageFor` in `apps/web/src/lib/route-rules.ts` hold both rules, for the Worker and the dev server alike.

## Architecture Rule: Two Layers

1. Structural layer. Fixed section types (header, summary, experience, internship, projects, organizations, education, certifications, skills, languages, plus custom sections from an approved variant list). The canonical type order and per-type field schemas live in `packages/resume/src/schema-registry.ts`. Each field has a restricted TipTap schema: bold, italic, bullet list, ordered list, link. No tables, no multi-column layout, no text boxes, no inline images, no custom heading levels beyond what the section template defines.

2. Presentation layer. Typography, spacing, color, accent styles, section visual ordering. Fully customizable. Must never alter the underlying linear text structure used for parsing or export.

Any feature request that adds structural freedom (tables, columns, floating elements, decorative icons in text runs) is out of scope unless it is presentation-only and degrades gracefully to plain text in export.

The one shipped example of that carve-out is the opt-in header photo: off by default, stored as a downscaled data URL on `header.photo`, rendered by each template's header (never absolutely positioned), embedded in PDF and DOCX, ignored by TXT. `apps/web/scripts/validate-exports.ts` enforces that adding a photo never changes the extracted text of any export.

## Data and Storage

- zustand holds working state, synced to IndexedDB on change (debounced).
- No resume content is sent to any server, API route, or Worker. Confirm this on every PR touching data flow.
- Document shape is versioned by the in-document `schemaVersion` plus a forward-only, read-time migration ladder (`packages/resume/src/migrations.ts`, with the steps in the `migrations-v*.ts` range files beside it). Ship the shape change, the `CURRENT_SCHEMA_VERSION` bump, and the ladder rung in the same PR. Full reference: `docs/schema-migrations.md`.
- The IndexedDB `DB_VERSION` is separate and governs object stores/indexes only. Never bump it for a field-shape change; never reshape documents inside the idb `upgrade` callback. A bump waits for tabs on the older build to close; `getDb` reports the wait and the hand-over on `DB_EVENTS`, and `PlatformDatabaseNotice` tells the person (see `docs/schema-migrations.md`).
- Migration steps must be bail-safe: when a document does not match the expected shape, keep the original data and no-op; never blank or replace what cannot be parsed.
- Raw pre-migration documents are snapshotted to the `backups` object store before migration. Documents that fail migration are surfaced as unreadable in the UI and are never deleted or overwritten.
- Profiles are workspaces (`packages/resume/src/profile.ts`). A profile holds personal information and a summary in the `profiles` object store, and the active profile id lives in the `app` store. Each résumé belongs to one profile through its optional `profileId`. A résumé with no `profileId`, or with one that no longer exists, belongs to the first profile (`resolveResumeProfileId`). The library, Recent, and the template page's "Preview with" show only the active profile's résumés (`useProfileResumes`). A new résumé joins the active profile, and a Sample or Blank start takes its header and summary from it (`applyProfile`); an import keeps the file's own. Deleting a profile first moves its résumés to another profile (`moveToProfile`, which keeps `updatedAt`), and the last profile cannot be deleted. `profileId` is organization only: it never renders and never exports. A profile's `header` has the résumé header's shape, so a change to `HEADER_SCHEMA` must also carry existing profiles. With none saved, an in-memory guest stands in; adding a profile saves the guest, so its résumés keep a profile.

## Desktop shell

- `apps/desktop/src-tauri/tauri.conf.json` holds two values that must never change. `identifier`
  (`com.rimzzlabs.lanjut`) keys the webview data directory, and with it every user's
  IndexedDB. `useHttpsScheme` (`false`) moves that same storage when flipped. Changing
  either orphans the résumés of everyone who already installed the app.
- The window opens on `/editor`. Tauri falls back from `<path>` to `<path>.html`,
  then to `<path>/index.html`, then to the root `index.html`, so links need no
  trailing slash. `/editor/<id>` has no file, so a reload lands on the root file.
  The desktop build therefore renders the app there (`PlatformDesktopRoot`), not the
  landing page, and reads the language and route from the address. The desktop
  window never shows the landing page.
- `dangerousDisableAssetCspModification` lists `style-src` and must keep listing it.
  Tauri appends a hash source to every directive it manages. A `style-src` that
  carries a hash makes the browser ignore `'unsafe-inline'`. The app then drops every
  `style` attribute in the exported HTML, and that includes the `--sidebar-width` that
  carries the whole platform layout. A static build cannot nonce those attributes, so
  the two cannot both hold. `script-src` keeps its injection, which is the
  directive that stops script execution.
- Every file the app hands to a user goes through `triggerDownload` in
  `apps/web/src/components/editor/download-file.ts`. A new export format that builds its own
  anchor will work on the web and do nothing at all in the desktop app. The function
  resolves false when the user cancels the save dialog, which is not an error.
- The app requires macOS 13 (`bundle.macOS.minimumSystemVersion`). PDF export runs takumi-pdf's WebAssembly, which the CSP allows through `'wasm-unsafe-eval'` in `script-src`, and WebKit honors that keyword only from Safari 16, which macOS 13 ships. Lowering the minimum breaks PDF export on older systems.
- macOS is the only desktop target. The shell has never been built or run on Windows,
  so do not describe it as supported until it has been.
- A tagged release publishes one `.dmg` per architecture. The build is unsigned, so
  macOS refuses to open it until the quarantine attribute is cleared. That is a paid
  Apple membership away from being fixed, not a code change.
- The updater verifies a signature. The public key lives in `tauri.conf.json` and the
  private key lives only in the `TAURI_SIGNING_PRIVATE_KEY` repository secret. When the
  two keys do not match, `tauri build` only prints a warning and the build still
  passes. A wrong pair then fails silently at runtime, and every update check
  quietly does nothing.
- `bundle.targets` must keep `app` beside `dmg`. On macOS the updater ships the `.app`
  bundle as a signed tarball, and a `dmg` alone builds no such artifact. The release
  then carries no `latest.json`, every update check reads a 404, and the failure is
  silent by design. The 0.17.0 release shipped this way.
- release-please cuts every release as a draft, with its tag created at once
  (`draft` and `force-tag-creation` in `release-please-config.json`). The `publish`
  job makes it public only after both desktop builds pass. A failed build therefore
  leaves a hidden draft, and `releases/latest`, which the download button and every
  installed updater read, stays on the last complete release.
- Nothing `tauri-action` reports can fail a release on its own. It warns and carries
  on when it builds no updater artifact, and again when it finds no signature. Each
  architecture also merges its own entry into the one `latest.json`, so two builds
  that finish together can drop an entry. The `publish` job reads the manifest off
  the draft and confirms it signs every architecture before the release goes public
  (`.github/scripts/check-update-manifest.mjs`). Keep its `PLATFORMS` list in step
  with the desktop matrix.
- Repair a failed release with `gh run rerun --failed <run-id>`. That runs the failed
  jobs again inside the original run, runs `publish` after them, and updates the
  checks the run already wrote. A `workflow_dispatch` starts a separate run instead,
  and GitHub adds those checks beside the old ones rather than replacing them, so the
  commit stays red even after the assets arrive. The 0.17.1 release reads that way.
  Keep the `tag` input for a run that is too old to repeat.
- An update check is a network call the user did not ask for. It runs at most once
  every three days, a failure is silent, and nothing installs without a click.
- Biome ignores `apps/desktop/src-tauri`. Rust is formatted by `cargo fmt`, and the JSON config files
  are written by the Tauri CLI.

## Reordering

- Section reordering (drag-to-reorder via @dnd-kit, `reorderSections` in the store) changes ordering metadata only. It does not alter content schema. Summary is pinned below the Header and does not participate; every other section type is reorderable (`REORDERABLE_SECTION_TYPES` in `packages/resume/src/schema-registry.ts`). Entries within a section are not manually reordered; they sort by date.

## Export

- PDF export must preserve linear reading order. Do not use a method that achieves visual layout via absolute positioning that breaks text extraction order. Verify with a text-extraction test (e.g., pdftotext) after any change to the PDF generation path.
- Provide a plain text or .docx export path in addition to PDF. This is the actual ATS-safe submission format for many applicant tracking systems.
- Before marking export work done, run output through at least one real parser test (Workday/Greenhouse test upload, or an open-source resume parser) and confirm fields map correctly.
- Entry blocks (experience, education, certificate, and the internship/projects/organizations and custom `list` sections that reuse the experience kind) must never split across a page break; their title, subtitle, and body stay on one page, matching the on-screen paginator which never splits a block. `isAtomicBlock` in `apps/web/src/components/editor/resume-blocks.ts` is the source of truth. `TakumiResumeFlow` marks atomic blocks with `data-atomic`, and the PDF stylesheet gives them `break-inside: avoid`. A section heading stays with its first entry the same way: the flow wraps each `keepWithNext` run (from `groupBlocks` in `resume-paginate.ts`) in one `data-keep` group, because takumi-pdf ignores `break-after: avoid`.
- Keep an entry's first bullet within 1.4 line heights of the line above it. Parsers such as OpenResume start a new entry at a larger gap, and the entry then loses its description. The experience items use `mt-1` above the description for this reason.
- The PDF comes from the preview's own templates (`apps/web/src/components/editor/takumi/`), so a template change shows in the preview and the PDF at once. takumi-pdf 0.15 has gaps that `takumi-css.ts` works around: it draws solid borders only (dotted and dashed rules are drawn as a repeated SVG background under a transparent border), it drops a `var()` with whitespace inside its parentheses (the stylesheet is compacted), it strokes the 700 face to fake weights above it (`font-extrabold` and `font-black` are held at 700, as a browser renders them with the catalog fonts), it drops `:where()` selectors and the `margin-block-end` longhand (every `space-y-*` utility is restated as a bottom margin), it writes a CSS list marker after the item's text (the flow sets `TextListMarkersContext`, so `ResumeRichText` writes a "•" or number before each item), letter spacing splits words for parsers (template tracking is reset in the PDF), and no résumé font has a square glyph (square bullets are set in `SquareBullet.ttf`, a font whose "•" is a square, built by `apps/web/scripts/build-square-bullet-font.py`, so the marker stays visible text with no image or hidden glyph). Check a new template style against these before relying on it.

## Documentation

- Docs are part of the change, not a follow-up. Before opening a PR, check whether the change makes any of these stale and update the affected ones in the same PR:
  - `README.md`: user-facing features, template list, tech stack table, scripts.
  - `AGENTS.md`: tech stack, section types, architecture rules, conventions.
  - `design.md`: design system, tokens, routes, page-type families.
  - `docs/schema-migrations.md`: any document-shape or `DB_VERSION` change.
  - `docs/export-validation.md`: any change to the PDF/docx/txt export path.
  - `apps/web/FONTS.md` and `apps/web/public/fonts/OFL.txt`: any font that is added, removed, or updated, in `public/` or in the Astro `fonts` config. A family with a Reserved Font Name ships as its unmodified upstream files, never as a subset (`FONTS.md` says why).
- Common triggers: adding or removing a dependency (tech stack lists), a new section type or field shape (section-type lists), a new user-facing capability (README features), a new script (scripts tables), a new route or server surface (`design.md`, the data-flow rule).
- Verify every documented claim against the code before writing it. Describe what ships, not intended behavior. A doc that overstates the product is worse than a missing line.

## Commits

- Use commitizen format via commitlint config. Do not bypass with --no-verify.
- lefthook runs Biome and Prettier on staged files before each commit, commitlint on the message, and `pnpm typecheck` before each push. Do not commit with failing lint or format checks.

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
- Components live in `apps/web/src/components/<domain-name>/*`, grouped by their domain (e.g. `apps/web/src/components/landing/landing-hero.tsx`). Never a global `components/` dump by type, and never colocated under `apps/web/src/pages/` route folders.
- Shared non-primitive components (used across domains, but not base UI primitives) live in `apps/web/src/components/shared/*`.
- Shared UI primitives only in the shadcn-managed `packages/ui/src/components` directory.
- The primitives carry local edits that `shadcn add --overwrite` erases: labels from the `ui` messages namespace (dialog, sheet, sidebar, spinner, breadcrumb), the `color-mix` primary hover on the button and the badge, the slider value bubble, the `Input` guard for an `undefined` value, the required asterisk on `FieldLabel`, the toggle `xs` size, the boxed `Accordion`, and the Biome suppressions. Diff against git and restore them after a re-add. The CLI also writes `import { cn } from "cn"` and adds a `cn` package: point the import at `@/lib/utils` and drop the package.
- `apps/web` never imports `@base-ui/react`. Use the shadcn primitive from `@lanjut/ui`, restyled through `className` if necessary. If shadcn has no such primitive, add a custom one to `packages/ui/src/components`.
- Compose the existing primitives in `packages/ui/src/components`; do not hand-roll their equivalents. A callout or notice is an `Alert`, a scrollable region is a `ScrollArea`, and so on. Never reach for raw markup (a bare `<p>` plus link) or a native `overflow-y-auto` when a primitive already covers it. Note: base-ui's `ScrollArea` only scrolls when its Root has a definite height (an explicit height, or a grid track); a `flex-1` used size is not enough.
- No comments restating what code does. Comment only on complex logic where intent is not recoverable from reading the code (e.g., a non-obvious mathematical computation, a workaround for a library bug, a non-standard algorithm).
- Do not reach for `useEffect` as a default tool for state synchronization, computed values, or event response. Before adding a `useEffect`, check whether the case matches one of the patterns in https://react.dev/learn/you-might-not-need-an-effect. Valid `useEffect` use is limited to synchronizing with an external system (IndexedDB writes, subscriptions, third-party widget instances). Derived state belongs in render or in zustand selectors, not in an effect that copies state into state.
- Separate components by concern. A list is not one component. Split into list container, list item, and item-internal pieces as separate components, each in its own file or clearly separated block. Do not collapse a list and its item rendering logic into a single component body.
- Never destructure in a parameter list, including library callbacks (react-hook-form `render`, TipTap). Name the parameter (`props`, `controller`, `context`) and destructure on the first line of the body.
- Props destructuring is capped at 3 fields. If a component needs more than 3 fields from props, do not destructure, access fields directly via `props.fieldName`. This applies above the 3-field threshold only, not below it.
- No default exports for function components or utility functions. All exports are named.
- Data transforms on arrays and strings go through ts-belt: `pipe(value, A.map(...), A.filter(...), A.join(", "))` with its modules (`A`, `S`, `N`, `O`, `R`, `G`, `D`, `F`). Do not mix ts-belt and native methods in one flow. JSX list rendering (`{items.map(...)}`) stays native. Keep a native call only where ts-belt has no equivalent (a callback replacer, `localeCompare`) or where a hot loop needs it.
- ts-belt returns `ReadonlyArray`, and the résumé model follows it (`Resume.sections`, `Section.entries`). Replace an array instead of mutating it (`A.append`, `A.reject`, `A.sort`). Use `F.toMutable` only at a library boundary that needs a mutable array: react-hook-form field arrays, TipTap `JSONContent`, zod-inferred types, nextstepjs, takumi-pdf. Never enable `Belt.UseMutableArrays`.
- Index and length go through ts-belt too: `A.get`, `A.head`, `A.last`, `S.get`, `A.length`, `A.isEmpty`, `S.isEmpty`. Their `Option` results are handled with `O` (`O.isNone` early exits, `O.getWithDefault`, `O.mapWithDefault`, `O.match`, `O.flatMap`), not with `??`, `?.`, truthiness, or `G.isNullable`. Values that are nullable for other reasons (optional props, DOM lookups, library results) stay as they are.
- In this ts-belt release only `undefined` is None at runtime: `null` counts as Some, and `O.map` boxes an `undefined` result. Do not feed `O` an array that can hold `null`, and use `O.mapWithDefault`, `O.match`, or `O.flatMap` when a mapper can return `undefined`.
- Do not mutate data. No property or element assignment, no `push`/`splice`/`sort`/`reverse`/`fill`, no `delete`, no accumulator loops. Build with literals, spread, and ts-belt (`A.append`, `A.updateAt`, `D.set`, `D.merge`, `D.deleteKey`), and return the new value. The store's `updateOpen` takes a pure `(resume) => Resume`; returning the same object is a no-op (no undo step, no save). Use `updateSections`, `updateSectionById`, and `updateSectionOfType` from `@/lib/resume` for section changes. DOM and browser objects, refs, and library APIs built on mutation are the only exceptions.
- Ternaries are for short, one-line values only (`const label = open ? t("close") : t("open")`, or a one-line JSX swap such as `{busy ? <Spinner /> : <Icon />}`). No nested, multi-line, or array/object-literal ternaries: use an early return, `O.match`, a `Record` lookup, `&&`, or a small function or component.
- Frontend code returns errors as values with ts-belt `R` (`R.makeOk`, `R.makeError`, `R.match`), as `runMigrations` and `runParserProof` do. The one throw is `getDb` in `packages/resume/src/db/schema.ts`: it guards the persistence boundary, where every IndexedDB call already fails by rejecting.
- Keep files under 600 lines. Split a long module by concern into siblings that share its prefix (`parse-header.ts`, `resume-form-adapter-jobs.ts`), and import from the module that defines a symbol, never through a re-export file.
- `A.sort` sorts a copy and is stable. Do not use `toSorted`: the macOS app runs on the system WebKit, which lacks it before Safari 16.
- Prefer named function declarations (`function ComponentName(props) {}`) over arrow function assignments (`const ComponentName = (props) => {}`) for components and standalone functions. Arrow functions are permitted only for inline functions defined inside JSX (event handlers, render callbacks passed as props).
