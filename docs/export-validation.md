# Export validation

The résumé exports (PDF, `.docx`, `.txt`) must stay **ATS-parseable**: real, selectable
text in linear reading order, with every field mappable by a parser. Two layers of
verification back this up.

## 1. Automated text-extraction gate

```bash
pnpm validate:exports
```

`scripts/validate-exports.tsx` regenerates all three exports from the seed résumé and
extracts their text with real parsers: `unpdf` for the PDF, `jszip` for the `.docx`
XML, and the serializer output for `.txt`. It then asserts:

- **Reading order**: `Summary → Experience → Education → Certificates → Skills →
  Languages` appears in that order in every format.
- **Field mapping**: name, headline, email, website, each employer, education,
  certificate, a representative skill, and a language are all present in the extracted
  text.

This is the pdftotext-equivalent text-extraction test required by `AGENTS.md`. **Run it
after any change to an export path** (`pdf/`, `docx/`, `resume-to-text.ts`,
`buildResumeBlocks`, or the rich-content model). It exits non-zero on failure.

Because all three exporters consume the same `buildResumeBlocks` sequence as the
on-screen preview, passing here means content, ordering, sorting, and empty-section
gating match across the preview and every output.

## 2. Manual real-parser pass (before release)

The automated gate proves text is extractable and ordered; a real ATS proves the fields
land in the right slots. Do this at least once per meaningful export change:

- [ ] Open the PDF in a viewer and confirm text is **selectable** (not an image) and
      copies out in reading order.
- [ ] Run the PDF and `.docx` through an open-source résumé parser (e.g. Affinda's free
      tool, or `pyresparser`); confirm **name, email, phone, work history, education,
      and skills** map to the correct fields.
- [ ] If available, upload to a real ATS sandbox (Greenhouse / Workday test posting) and
      confirm the parsed application is complete and correctly ordered.
- [ ] Confirm no content is dropped and no section is reordered.

## Parser notes

Real parsers (e.g. [OpenResume](https://www.open-resume.com)) use strict heuristics.
Decisions made to satisfy them:

- **Website is exported as a full `https://` URL**, not a bare domain. Parsers only
  recognize a link when it has a scheme (`https://…`), a `www.` prefix, or a path
  slash; `johndoe.dev` alone is not detected.
- **Contact icons are drawn as vector SVG**, so they never appear in the extracted
  text and can't interfere with field detection.
- **`letterSpacing` is banned in PDF template styles.** react-pdf positions
  letter-spaced glyphs individually, so extractors read `J o h n D o e`; word
  boundaries are destroyed and fields stop matching. `textTransform: "uppercase"`
  is fine (whole words survive; the gate matches fields case-insensitively). The
  DOM preview may still use CSS `tracking-*`; it is never text-extracted.
- **Location** relies on the parser. OpenResume, for one, only matches US-style
  `City, ST` with a **two-letter** state (regex `[A-Z][a-zA-Z\s]+, [A-Z]{2}`); a full
  "City, Province, Country" won't be detected as a location. This is a parser
  limitation, not an export defect; entering a 2-letter state code makes it parse.
