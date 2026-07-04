# Summary

<!-- What does this PR do, and why? Link the issue it addresses if there is one. -->

Closes #

## Type of change

- [ ] Bug fix
- [ ] Feature

## How was this tested?

<!-- Manual steps, browsers checked, screenshots/recordings for UI changes. -->

## Checklist

- [ ] The PR title follows the commitlint convention (`feat: ...` / `fix: ...`, subject fully lowercase — it becomes the squash-merge commit).
- [ ] Lint and format pass locally (`biome check`); commits were made without `--no-verify`.
- [ ] No résumé content is sent to any server, API route, or open-next function (confirm on every PR touching data flow).
- [ ] Changes keep the structural layer intact: presentation-only styling, no tables/columns/floating elements in the document model.
- [ ] If the export path changed: text extraction order verified (e.g. `pdftotext`) and output checked against at least one real ATS parser.
- [ ] If the résumé schema changed: schema version bumped and a migration path added for existing saved résumés.
