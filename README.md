# Lanjut

ATS Builder. Free, open-source resume builder. Runs locally in the browser. No account, no server-side storage of resume content.

## What This Is

A resume builder split into two layers:

- **Structural layer**: fixed section types (header, summary, experience, education, skills) with a restricted rich-text schema per field. This keeps export output parseable by Applicant Tracking System (ATS) software.
- **Presentation layer**: typography, spacing, color, and theming. Fully customizable. Changes here never affect the underlying text structure used for parsing or export.

Customization applies to how the resume looks. It does not extend to layouts that break ATS parsing (tables, multi-column body text, floating text boxes, embedded icons in text runs).

## Features

- Drag-and-drop section and entry reordering
- Rich text editing per field, scoped to ATS-safe formatting (bold, italic, lists, links)
- Local persistence via IndexedDB, no data leaves the browser
- Export to PDF (linear reading order preserved) and plain text / .docx
- Fully local: works offline after initial load

## Tech Stack

| Purpose | Library |
|---|---|
| Framework | Next.js (App Router) |
| Hosting | open-next on Cloudflare |
| UI components | shadcn (base-ui) |
| Styling | Tailwind CSS |
| Drag and drop | dnd-kit |
| Rich text editor | TipTap |
| Animation | motion/react |
| State | zustand |
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

## Data and Privacy

Resume content is stored in IndexedDB in the browser. No resume content is sent to any server, API route, or third-party service. Clearing browser storage deletes saved resumes; export your work before doing so.

## Export Formats

- **PDF**: structured text export, not a visual snapshot. Reading order is preserved for ATS text extraction.
- **DOCX / plain text**: direct ATS-submission-safe formats, recommended over PDF for systems with strict parsing requirements.

## Contributing

Commit messages follow Conventional Commits via commitlint and commitizen. Run `pnpm commit` instead of `git commit` to use the prompt. Pre-commit hooks (husky + lint-staged) run lint and format checks before any commit is accepted.

See `AGENTS.md` for architecture rules and code conventions before submitting a PR.

## License

[AGPL-3.0-only](LICENSE). Copyright © 2026 Rizki Citra.