<p align="center">
  <img src="public/favicon.svg" alt="" width="56" height="56" />
</p>

<h1 align="center">Lanjut</h1>

<p align="center">
  ATS Builder. Free, open-source resume builder. Runs locally in the browser. No account, no server-side storage of resume content.
  <br />
  <a href="https://lanjut.rimzzlabs.com"><strong>lanjut.rimzzlabs.com</strong></a>
</p>

## What This Is

A resume builder split into two layers:

- **Structural layer**: fixed section types (header, summary, experience, education, skills, languages, certificates) with a restricted rich-text schema per field. This keeps export output parseable by Applicant Tracking System (ATS) software.
- **Presentation layer**: typography, spacing, color, and theming. Fully customizable. Changes here never affect the underlying text structure used for parsing or export.

Customization applies to how the resume looks. It does not extend to layouts that break ATS parsing (tables, multi-column body text, floating text boxes, embedded icons in text runs).

## Features

- Six résumé templates, all sharing one linear document structure; only styling differs
- Template gallery with search, sort, and live seed-data previews
- Résumé library with live first-page thumbnails, rename, and delete
- Print-accurate A4 preview with automatic pagination
- Rich text editing per field, scoped to ATS-safe formatting (bold, italic, lists, links)
- Local persistence via IndexedDB, no data leaves the browser
- Export to PDF (linear reading order preserved) and plain text / .docx
- Fully local: works offline after initial load

## Templates

| Template | Character |
|---|---|
| **Awal** | Clean single-column starter with room for every section |
| **Ketat** | Compact serif classic: ruled headings, italic dates |
| **Luasa** | Airy minimalist: letterspaced headings, generous whitespace |
| **Tebal** | Bold modern statement: oversized name, heavy uppercase headings |
| **Klasik** | Traditional all-serif CV: centered, quiet, formal |
| **Ketik** | Typewriter-flavored technical look, built for developers |

Every template renders the same linear block sequence, so switching templates never changes parse or export order.

## Tech Stack

| Purpose | Library |
|---|---|
| Framework | Next.js (App Router) |
| Hosting | open-next on Cloudflare |
| UI components | shadcn (base-ui) |
| Styling | Tailwind CSS |
| Rich text editor | TipTap |
| Animation | motion/react |
| State | zustand |
| Search params state | nuqs |
| Persistence | IndexedDB (via idb) |
| Utilities | @mobily/ts-belt |
| Dates | date-fns |

## Getting Started

```bash
git clone https://github.com/rimzzlabs/lanjut.git
cd lanjut
pnpm install
pnpm dev
```

Open `http://localhost:3000`.

### Useful scripts

| Script | What it does |
|---|---|
| `pnpm dev` | Start the dev server |
| `pnpm lint` / `pnpm format` | Check / write with Biome |
| `pnpm validate:exports` | Regenerate PDF/DOCX/TXT from the seed résumé and verify extraction order and field mapping |
| `pnpm preview` | Build with open-next and preview the Cloudflare worker locally |
| `pnpm ship` | Build and deploy to Cloudflare |
| `pnpm commit` | Commit via the commitizen prompt |

## Data and Privacy

Resume content is stored in IndexedDB in the browser. No resume content is sent to any server, API route, or third-party service. Clearing browser storage deletes saved resumes; export your work before doing so.

## Export Formats

- **PDF**: structured text export, not a visual snapshot. Reading order is preserved for ATS text extraction.
- **DOCX / plain text**: direct ATS-submission-safe formats, recommended over PDF for systems with strict parsing requirements.

Changes to the export path are gated by `pnpm validate:exports`, which regenerates every format from the seed résumé and verifies, via real text extraction, that linear reading order is preserved and every field maps through.

## Contributing

Bug reports and feature requests go through the issue forms; note the scope rules there: presentation is customizable, structure is not, and accounts/server storage are non-goals.

Commit messages follow Conventional Commits via commitlint and commitizen. Run `pnpm commit` instead of `git commit` to use the prompt. Pre-commit hooks (husky + lint-staged) run lint and format checks before any commit is accepted. PR titles follow the same convention with a fully lowercase subject; they become the squash-merge commit.

See `AGENTS.md` for architecture rules and code conventions before submitting a PR.

## License

[AGPL-3.0-only](LICENSE). Copyright © 2026 Rizki Citra.
