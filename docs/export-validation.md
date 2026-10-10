# Export validation

The résumé exports (PDF, `.docx`, `.txt`) must stay **ATS-parseable**: real, selectable
text in linear reading order, with every field mappable by a parser. Two layers of
verification back this up.

## 1. Automated text-extraction gate

```bash
pnpm validate:exports
```

`apps/web/scripts/validate-exports.ts` regenerates all three exports from the seed résumé and
extracts their text with real parsers: `unpdf` for the PDF, `jszip` for the `.docx`
XML, and the serializer output for `.txt`. It then asserts:

- **Reading order**: `Summary → Experience → Education → Certificates → Skills →
Languages` appears in that order in every format.
- **Field mapping**: name, headline, email, website, each employer, an employer and a
  school location, company context, education, certificate, a representative skill,
  and a language are all present in the extracted text.
- **Company-context order**: an optional company-context line follows its employer
  and precedes the entry's achievements in every format.
- **Photo invariance**: rendering with the opt-in header photo must leave the
  extracted text of every template PDF and the `.docx` byte-identical to the
  photo-free output. The photo is presentation-only; if it ever shifts, drops, or
  adds a character of extracted text, the gate fails.

`apps/web/scripts/takumi-checks.ts` loads the takumi-pdf renderer through Vite, the way the app
bundles it, and runs the PDF checks on every template. It adds:

- **Font families**: each template's PDF embeds the families it draws with (recorded
  in `takumi-checks.ts` from the react-pdf exports it replaced, plus SquareBullet for
  Luasa's square bullets). A stylesheet rule the
  renderer drops (it once lost the serif and mono families) fails here instead of
  silently printing in Inter. The export loads only these families
  (`TEMPLATE_FAMILIES` in `takumi-fonts.ts`), with Inter always loaded as the
  fallback, or the chosen font and Inter. Keep the two lists in step: a family a
  template draws with but does not load fails this check.
- **No faked weights**: no text is drawn with a stroke render mode. takumi-pdf
  strokes the 700 face to fake a heavier weight, which a browser never does.
- **No hidden text**: no fill is drawn at zero opacity. Text drawn that way is
  hidden from the reader but not from a parser, and ATS checkers flag it.
- **No split entries**: a long résumé whose entries open with `START-n` and close with
  `END-n` must keep each pair on one page.
- **Parser-ready bullets**: in content order, a "•" comes before each list item's
  text, and an entry's first bullet sits within 1.4 line heights of the line above
  it. Parsers find bullets by a leading "•" and start a new entry at a larger gap,
  as the OpenResume parser does.
- **No orphaned headings**: a summary that grows three lines at a time pushes the
  Experience heading down to the page foot and past it. At every step the heading and
  its first entry must print on the same page.
- **No ligatures**: Lora and Merriweather résumés keep `fi` and `fl` as separate
  glyphs, read from the embedded ToUnicode maps (`bfchar` and `bfrange`).
- **Cyrillic reads back**: a Russian summary in every template, and in every font a
  person can pick, must read back as the same Russian text. A face with no glyph for
  a letter prints nothing there, so this catches a font cut down to Latin only.
- **Import round trip** (`scripts/import-checks.ts`): the sample résumé, exported with
  each template, imports back with every field that template prints. Entries match by
  content, because the PDF lists them by date. Text compares without case, because some
  templates print text in capitals, and bold, italics, and inline links are not
  compared, because a PDF's text layer does not carry them. `NOT_PRINTED` lists the
  fields a template leaves out of its PDF.

This is the pdftotext-equivalent text-extraction test required by `AGENTS.md`. **Run it
after any change to an export path** (`takumi/`, `docx/`, `resume-to-text.ts`,
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
- **Template letter spacing is reset in the PDF.** The PDF places letter-spaced glyphs
  individually, so extractors read `S U M M A R Y`; word boundaries are destroyed and
  fields stop matching. The PDF stylesheet resets every `tracking-*` class to
  `letter-spacing: 0`, so the preview keeps its tracking and the PDF does not. The
  document-wide letter-spacing setting stays within -0.5..0.5, and the gate checks
  that every field still extracts at both ends. Uppercase is fine (whole words
  survive; the gate matches fields case-insensitively).
- **Ligatures are disabled in the PDF.** A shaper collapses `f`+`i` and `f`+`l`
  into a single ligature glyph whose ToUnicode maps back to two codepoints; readers
  that ignore the CMap then drop or garble the pair (e.g. `fintech` → `fntech`). The
  PDF stylesheet sets `font-variant-ligatures: none`, so each letter stays its own
  glyph with a single-codepoint ToUnicode. Kerning still applies, so the visual
  result is near-identical. The gate renders an fi/fl probe in Lora and Merriweather
  and fails if any glyph maps back to an `fi`/`fl` pair. The screen preview keeps
  native ligatures.
- **Entry locations join the subject with a comma** ("Acme Inc., San Francisco, CA"),
  in the preview, PDF, docx, and text alike. They ride on the employer/institution
  line rather than a column of their own, so the pair stays one contiguous phrase for
  extractors, and a linked company keeps the hyperlink on the company name only.
- **Location** relies on the parser. OpenResume, for one, only matches US-style
  `City, ST` with a **two-letter** state (regex `[A-Z][a-zA-Z\s]+, [A-Z]{2}`); a full
  "City, Province, Country" won't be detected as a location. This is a parser
  limitation, not an export defect; entering a 2-letter state code makes it parse.
- **Company context is a separate plain-text line** immediately after the
  employer/location line and before achievements. Keeping it inside the atomic entry
  wrapper prevents it from being orphaned across pages; empty context adds no line.
