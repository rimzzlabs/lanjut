# Summary

<!-- What does this PR do, and why? Link the issue it addresses if there is one. -->

Closes #

## Type of change

- [ ] Bug fix
- [ ] Feature

## How was this tested?

<!-- Manual steps, browsers checked, screenshots/recordings for UI changes. -->

## Checklist

- [ ] Every commit is signed off (`git commit -s`), certifying the [DCO](https://developercertificate.org/); the DCO check rejects unsigned commits (see [CONTRIBUTING.md](../CONTRIBUTING.md)).
- [ ] The PR title follows the commitlint convention (`feat: ...` / `fix: ...`, subject fully lowercase — it becomes the squash-merge commit).
- [ ] Lint and checks pass locally (`pnpm lint`, `pnpm validate:exports`); commits were made without `--no-verify`.
- [ ] The linked issue is referenced above, or this change is small enough not to need one.
- [ ] No résumé content is sent to any server, API route, or open-next function (confirm on every PR touching data flow).
- [ ] Changes keep the structural layer intact: presentation-only styling, no tables/columns/floating elements in the document model.
- [ ] If the export path changed: text extraction order verified (e.g. `pdftotext`) and output checked against at least one real ATS parser.
- [ ] If the résumé schema changed: schema version bumped and a migration path added for existing saved résumés.
