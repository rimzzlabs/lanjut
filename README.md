<p align="center">
  <img src="public/favicon.svg" alt="" width="56" height="56" />
</p>

<h1 align="center">Lanjut</h1>

<p align="center">
  ATS Builder. Free, open-source resume builder. Runs locally in the browser. No account, no server-side storage of resume content.
  <br />
  <a href="https://lanjut.org"><strong>lanjut.org</strong></a>
</p>

## What This Is

A resume builder split into two layers:

- **Structural layer**: fixed section types (header, summary, experience, internship, projects, organizations, education, certifications, skills, languages, plus custom sections from an approved list) with a restricted rich-text schema per field. This keeps export output parseable by Applicant Tracking System (ATS) software.
- **Presentation layer**: typography, spacing, color, and theming. Fully customizable. Changes here never affect the underlying text structure used for parsing or export.

Customization applies to how the resume looks. It does not extend to layouts that break ATS parsing (tables, multi-column body text, floating text boxes, embedded icons in text runs).

## Features

- Six résumé templates, all sharing one linear document structure; only styling differs
- Template page with search and a full-size preview of every page, on the sample or on one of your own résumés, with one-click apply (undoable in the editor)
- Profiles: keep one profile per kind of job or job market. Each profile keeps its own résumés and its personal information and summary, which every new résumé in it starts with. Manage them on the Profiles page, and switch from the avatar in the top bar, where Preferences also hold the theme, language, and animation settings
- Résumé library that leads with the résumé edited last, quick ways to start a new one, and every résumé as a grid or a list with live first-page thumbnails, its template, sort, rename, duplicate, download, and delete
- Print-accurate A4 preview with automatic pagination
- Rich text editing per field, scoped to ATS-safe formatting (bold, italic, lists, links), with undo and redo per field
- Optional company context for experience and internship entries, shown before achievements in every preview and export
- Document-level undo and redo across every edit (typing, reorder, layout, settings), from the editor toolbar or Ctrl/Cmd+Z
- Optional header photo (off by default): add a portrait in Personal Information and every template places it to match its own layout; exports embed it without affecting how parsers read the text
- Custom sections alongside the fixed types, all sharing the same restricted schema
- Drag to reorder sections and toggle any section's visibility (entries within a section sort by date automatically)
- Document-level presentation controls: font, font size, section spacing, line height, letter spacing, contact-icon visibility, and a one-click style reset
- Available in English and Indonesian (`use-intl`)
- Theme toggle and one settings menu (language, animation) in the landing and app navbars. The animation setting (System, On, Off) follows the operating system's reduced-motion setting on System
- Export to PDF (linear reading order preserved) and plain text / .docx
- Copy, download, and re-import a résumé as JSON or YAML, from a file or as pasted text shown in color
- Back up a profile with all its résumés as one small file and import it on another device; nothing goes to a server, an import never deletes anything, and where both devices have a résumé the newer one wins
- A readiness meter that shows what your résumé still needs, counting only your own words, never the sample's
- Guided tours of the library, templates, profiles, and editor for first-time users
- Send feedback in-app: a guided form for bugs, ideas, and wording fixes that checks for similar issues and shows the technical details it attaches (never the text of your résumé). Without a GitHub account, Lanjut posts it for you and links to the issue; with one, it opens the issue prefilled for you to post
- Local persistence via IndexedDB, no data leaves the browser. The editor's top bar confirms each save to the device and warns when the browser refuses one
- Fully local: works offline after initial load

## Templates

| Template   | Character                                                       |
| ---------- | --------------------------------------------------------------- |
| **Awal**   | Clean single-column starter with room for every section         |
| **Ketat**  | Compact serif classic: ruled headings, italic dates             |
| **Luasa**  | Airy minimalist: letterspaced headings, generous whitespace     |
| **Tebal**  | Bold modern statement: oversized name, heavy uppercase headings |
| **Klasik** | Traditional all-serif CV: centered, quiet, formal               |
| **Ketik**  | Typewriter-flavored technical look, built for developers        |

Every template renders the same linear block sequence, so switching templates never changes parse or export order.

## Tech Stack

| Purpose              | Library                                                                  |
| -------------------- | ------------------------------------------------------------------------ |
| Framework            | Astro (static output, React islands)                                     |
| Hosting              | Cloudflare Workers static assets, plus one Worker for the feedback relay |
| Build targets        | Web (default), desktop (`LANJUT_TARGET=desktop`)                         |
| Desktop shell        | Tauri 2 (macOS 13 or later)                                              |
| Internationalization | use-intl (English, Indonesian)                                           |
| UI components        | shadcn (base-ui, Vega style)                                             |
| Icons                | Phosphor (@phosphor-icons/react)                                         |
| Styling              | Tailwind CSS                                                             |
| Rich text editor     | TipTap                                                                   |
| Syntax colors        | Lezer (JSON and YAML parsers, in the paste dialog)                       |
| Forms                | react-hook-form + zod                                                    |
| Drag and drop        | @dnd-kit                                                                 |
| Export               | takumi-pdf (PDF from the preview HTML), docx                             |
| Animation            | motion/react                                                             |
| State                | zustand                                                                  |
| Search params state  | nuqs                                                                     |
| App routing          | wouter                                                                   |
| Persistence          | IndexedDB (via idb)                                                      |
| Utilities            | @mobily/ts-belt                                                          |
| Dates                | date-fns                                                                 |
| Lint / format        | Biome (code, JSON, CSS), Prettier (Markdown, YAML)                       |
| Git hooks            | lefthook                                                                 |
| Repository           | pnpm workspace                                                           |

## Getting Started

```bash
git clone https://github.com/rimzzlabs/lanjut.git
cd lanjut
pnpm install
pnpm dev
```

Open `http://localhost:4321`.

### Repository layout

| Workspace           | What it holds                                                        |
| ------------------- | -------------------------------------------------------------------- |
| `apps/web`          | The Astro site, the React app, and the Worker                        |
| `apps/desktop`      | The Tauri shell for macOS                                            |
| `packages/resume`   | The résumé document: model, migrations, import, interchange, storage |
| `packages/i18n`     | The English and Indonesian copy, and the routing helpers             |
| `packages/ui`       | The shadcn primitives                                                |
| `packages/tsconfig` | The shared TypeScript base                                           |

Run every script from the repo root.

### Useful scripts

| Script                             | What it does                                                                               |
| ---------------------------------- | ------------------------------------------------------------------------------------------ |
| `pnpm dev`                         | Start the Astro dev server and the feedback Worker                                         |
| `pnpm lint` / `pnpm format`        | Check / write with Biome (code) and Prettier (Markdown, YAML)                              |
| `pnpm typecheck`                   | Type-check every workspace                                                                 |
| `pnpm build`                       | Build the site into `apps/web/dist/`                                                       |
| `LANJUT_TARGET=desktop pnpm build` | Build the static desktop assets into `apps/web/dist-desktop/`                              |
| `pnpm desktop:dev`                 | Run the desktop shell against the dev server                                               |
| `pnpm desktop:build`               | Build the desktop app and installers                                                       |
| `pnpm validate:exports`            | Regenerate PDF/DOCX/TXT from the seed résumé and verify extraction order and field mapping |
| `pnpm preview`                     | Build the site and serve it through the Worker locally                                     |
| `pnpm ship`                        | Build and deploy to Cloudflare                                                             |
| `pnpm commit`                      | Commit via the commitizen prompt                                                           |

## Data and Privacy

Resume content is stored in IndexedDB in the browser. No resume content is sent to any server, API route, or third-party service. Clearing browser storage deletes saved resumes; export your work before doing so.

## Export Formats

- **PDF**: rendered from the same HTML as the preview, so the file matches what you see. It is real, selectable text in linear reading order for ATS text extraction, not a visual snapshot.
- **DOCX / plain text**: direct ATS-submission-safe formats, recommended over PDF for systems with strict parsing requirements.

Changes to the export path are gated by `pnpm validate:exports`, which regenerates every format from the seed résumé and verifies, via real text extraction, that linear reading order is preserved and every field maps through.

## Contributing

Bug reports, feature requests, and wording fixes go through the issue forms (or "Send feedback" in the app); note the scope rules there: presentation is customizable, structure is not, and accounts/server storage are non-goals.

Commit messages follow Conventional Commits via commitlint and commitizen, and every commit must be signed off (`git commit -s`) under the Developer Certificate of Origin. Run `pnpm commit` instead of `git commit` to use the prompt. Git hooks (lefthook) run Biome and Prettier on staged files before a commit, commitlint on the message, and a type check before a push. PR titles follow the same convention with a fully lowercase subject; they become the squash-merge commit.

See [CONTRIBUTING.md](CONTRIBUTING.md) for the full workflow (setup, branches, commits, DCO, releases) and `AGENTS.md` for architecture rules and code conventions before submitting a PR.

## License

[AGPL-3.0-only](LICENSE). Copyright © 2026 Lanjut Contributors.

The third-party fonts use the SIL Open Font License 1.1. [`apps/web/FONTS.md`](apps/web/FONTS.md) lists each font with its source and license.
