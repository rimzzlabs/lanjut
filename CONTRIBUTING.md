# Contributing to Lanjut

Thanks for helping build a free, open-source, local-first résumé builder. This document covers the mechanics of getting a change merged. For the product and architecture rules (the two-layer model, what is in and out of scope), read [AGENTS.md](AGENTS.md) first; PRs that add structural freedom to the résumé document (tables, columns, floating elements) will be declined regardless of implementation quality.

## Local setup

Prerequisites:

- Node.js 24 or newer
- pnpm 10 (the repo pins `pnpm@10.30.1` via the `packageManager` field, so `corepack enable` gives you the right version automatically)

```sh
git clone git@github.com:rimzzlabs/lanjut.git
cd lanjut
pnpm install
pnpm dev
```

The app runs at `http://localhost:3000`. There is no backend to configure: résumé data lives in your browser's IndexedDB and never leaves it. Keep it that way; no PR may send résumé content to a server, API route, or open-next function.

Useful scripts:

| Script | What it does |
| --- | --- |
| `pnpm dev` | Start the dev server |
| `pnpm lint` | Biome lint and format check |
| `pnpm format` | Apply Biome formatting |
| `pnpm validate:exports` | Validate the export pipeline |
| `pnpm build` | Next.js production build |
| `pnpm preview` | Build and preview the Cloudflare production bundle via open-next |
| `pnpm commit` | Guided Commitizen commit prompt |

## Branches

Branch off `main` and name the branch `type/short-kebab-description`, where `type` matches the commit type of the main change:

```
feat/docx-export
fix/sidebar-scroll-containment
docs/schema-migration-guide
chore/bump-tiptap
```

## Commits

Every commit must satisfy two rules.

**1. Conventional Commits format.** Messages follow the [Conventional Commits](https://www.conventionalcommits.org/) spec, enforced by commitlint (`@commitlint/config-conventional`). Run `pnpm commit` for a guided Commitizen prompt, or write it yourself: `type(scope): subject` with a fully lowercase subject. Allowed types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`.

**2. DCO sign-off.** Every commit must carry a `Signed-off-by` trailer matching the commit author. Add it with the `-s` flag:

```sh
git commit -s -m "fix: contain editor sidebar scrolling"
```

Signing off certifies the [Developer Certificate of Origin](https://developercertificate.org/): you wrote the change, or otherwise have the right to submit it under this project's license (AGPL-3.0-only). There is no CLA; the sign-off is the whole agreement. The DCO check on every pull request rejects unsigned commits.

If you used `pnpm commit` and it did not add the trailer, amend afterwards with `git commit --amend -s --no-edit`. If a whole branch is missing sign-offs, fix it in one go:

```sh
git rebase --signoff main
git push --force-with-lease
```

Husky's pre-commit hook runs lint-staged (Biome) on staged files. Do not bypass hooks with `--no-verify`.

## Before opening a PR

There is no automated test suite yet, so the required bar is:

- `pnpm lint` passes
- `pnpm validate:exports` passes
- `pnpm build` succeeds

CI runs all of these plus the Cloudflare production build (`opennextjs-cloudflare build`) on every PR, and all checks must be green before merge.

Two areas carry extra verification duties (see [AGENTS.md](AGENTS.md) for the full requirements):

- Changes to the export path: confirm PDF text-extraction order (for example with `pdftotext`) and run the output through at least one real ATS parser.
- Changes to the résumé document shape: bump `CURRENT_SCHEMA_VERSION` and add a migration rung in the same PR (`docs/schema-migrations.md`).

## Pull requests

- PRs are squash-merged, and the PR title becomes the commit subject on `main`. It must therefore follow the same commitlint convention, fully lowercase; a CI check enforces this. release-please parses these subjects to build releases, so a mislabeled title mislabels the release.
- Fill in the PR template, including the checklist.
- One approving review from a code owner is required before merge.
- Link the issue the PR addresses if one exists. For substantial changes, open an issue first so the approach can be discussed before you invest the work.

## Releases and versioning

Releases are fully automated by [release-please](https://github.com/googleapis/release-please). Do not hand-edit:

- `CHANGELOG.md`
- `version` in `package.json`
- `.release-please-manifest.json`

The bot derives version bumps and changelog entries from the conventional commit subjects landing on `main`, and opens a release PR that maintainers merge to tag and deploy. Your only responsibility is a correctly formatted PR title.

## Code of conduct and security

All participation is covered by the [Code of Conduct](CODE_OF_CONDUCT.md). To report a security vulnerability, follow [SECURITY.md](SECURITY.md); please do not open a public issue for it.

## License

Lanjut is licensed under [AGPL-3.0-only](LICENSE). By contributing, you agree that your contributions are licensed under the same terms, as certified by your DCO sign-off.
