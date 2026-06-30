# Richtext fields persist as ProseMirror JSON, not HTML

Richtext Field values are stored as TipTap's native ProseMirror JSON. Plain Fields (name, contact, dates, titles) skip TipTap entirely and render as ordinary inputs. Each richtext Field configures TipTap with exactly its allowed extensions; typing and paste are both filtered through that Restricted schema. Export converts JSON → PDF/text/docx at export time. We never store HTML.

## Why

- JSON is schema-validated: invalid nodes can't be represented, so the closed structural registry (ADR-0001) is enforced at the data layer, not just the UI. Pasting a Word table yields plain text.
- HTML would require re-parse and re-sanitize on every load and invites smuggled structure.
- Plain inputs for non-formatted fields avoid spinning up dozens of editor instances per resume.

## Consequences

- Export and static display both derive from the same JSON; there is one source of truth.
- v1 mounts a live editor per visible richtext field (simple). Mount-on-focus is a deferred performance optimization, not a v1 requirement.
