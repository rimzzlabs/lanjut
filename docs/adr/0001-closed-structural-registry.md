# Structural layer is a closed, code-defined registry

The set of Section types and the Field structure of each is defined in code (the Section schema registry), not by users. Users can add Sections, reorder them, relabel their titles, and fill in values — but they can never define new Field structures. The v1 catalog is the core four (summary, experience, education, skills) plus a single free-form escape-hatch type (title + repeatable title/richtext entries).

## Why

The product's entire value proposition is ATS-parseable export. Arbitrary user-defined structures (tables, custom field shapes, free layout) cannot carry an export guarantee. Closing the structural layer is what lets the export pipeline make a hard promise about reading order and field mapping. The presentation layer absorbs the user's desire for customization instead.

## Consequences

- Adding a new Section type is a code change (new registry entry + export mapping), deliberately — it forces the parseability question to be answered before the type ships.
- Section title is presentation/label data, decoupled from parse shape. Relabeling is always safe.
- The curated catalog (projects, certifications, languages, …) is additive future work; it does not change this boundary.
