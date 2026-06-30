# Lanjut

A local-first, ATS-safe résumé builder. The domain splits into a **structural layer** (the parseable content: header + sections) and a **presentation layer** (typography, spacing, color — never alters the linear text structure).

## Language

**Resume**:
A single résumé document owned by the user. Has a versioned schema, a privileged Header, an ordered list of Sections, and Presentation settings.
_Avoid_: CV, document, file

**Header**:
The privileged, non-reorderable, single-instance top of a Resume holding identity and contact information. Always first in reading order. Not a Section.
_Avoid_: contact block, top section

**Section**:
A typed, reorderable unit of the structural layer below the Header (summary, experience, education, skills, custom). Contains an ordered list of Entries. Participates in drag-and-drop ordering.
_Avoid_: block, panel

**Entry**:
A repeatable item within a Section (e.g. one job in Experience, one school in Education). Reorderable within its Section. Holds a map of typed Fields. Single-blob sections (e.g. Summary) have exactly one Entry.
_Avoid_: item, record, row

**Field**:
A typed value slot within an Entry, identified by a stable key. Either `plain` (string, no formatting) or `richtext` (restricted TipTap document). The smallest unit of structural content.
_Avoid_: input, attribute

**Custom section**:
A user-added Section beyond the core four. In v1, the only custom type is the free-form escape hatch: a section with a user-set title and repeatable Entries of (title + restricted richtext body). "Custom" means optional/user-added and relabelable — never a user-defined field structure. A future curated catalog (projects, certifications, etc.) will add more known schemas.
_Avoid_: free section, arbitrary section

**Section title**:
The user-visible label of a Section (e.g. renaming "Experience" → "Work History"). Presentation/label data only. Changing it never changes the Section's parse shape or Field schema.
_Avoid_: section name, heading

**Section schema registry**:
Code-side (not persisted) definition of each Section type: which Field keys it has, each Field's kind, and the allowed TipTap extensions per richtext Field. Saved Resume data holds only values, never the schema.
_Avoid_: section config, template

**Restricted schema**:
The explicit per-Field TipTap extension allowlist (bold, italic, bullet/ordered list, link, plus base document/paragraph/text). Both typing and paste are filtered through it, so disallowed structure (tables, headings, images) cannot be represented or pasted in. The runtime enforcement point of the closed structural registry.
_Avoid_: editor config, formatting options

**Library**:
The surface (route `/`) listing all Resumes with create / duplicate / rename / delete, and the app's landing/empty state. Backed by the Resume index.
_Avoid_: dashboard, home, gallery

**Seed fixture**:
The single code-defined sample Resume ("John Doe" persona — full content across all core sections) that every newly created Resume is initialized from. Also reused as the Parser gate's test fixture. Export warns if the identity fields are still byte-identical to the seed.
_Avoid_: sample, template, default doc

**Resume index**:
The lightweight list of all Resumes (id, title, updatedAt) held in memory to drive the library/list UI, separate from the single fully-hydrated open Resume. The full body of a non-open Resume is not kept in memory.
_Avoid_: resume list (as a data concept), catalog

**Schema version**:
An integer stored inside each Resume document recording the field-shape version it was written against. Drives read-time migration. Distinct from the IndexedDB DB version (which governs object-store/index structure only).
_Avoid_: doc version, db version (for this concept)

**Migration ladder**:
The ordered set of pure functions `migrate N → N+1` over plain document JSON. On read, a Resume below the current schema version is stepped up through the ladder before reaching the store. Forward-only.
_Avoid_: upgrade, transform

**Structural layer**:
The parseable content of a Resume — Header and Sections and their text. Export and ATS parsing depend on it. Constrained on purpose.

**Presentation layer**:
Typography, spacing, color, accent, and visual ordering. Fully customizable. Must never change the linear text structure used for parsing or export.

**Presentation tokens**:
The serializable set of presentation values (font family/scale, spacing, color/accent, etc.) attached to a Resume. Consumed identically by the editing preview and every exporter. The only thing presentation is allowed to vary.
_Avoid_: theme config, styles

**Theme**:
A named, code-defined preset that sets all Presentation tokens at once. Selecting one populates the Resume's tokens; the user may then tweak individual tokens. User-saved custom themes are deferred — customization lives as the Resume's token values, not as a saved theme.
_Avoid_: template, skin, preset (loosely)

**Exporter**:
A pure function from the structural document model + Presentation tokens to an output format (PDF, DOCX, TXT). Never scrapes the DOM. Iterates the model so reading order is guaranteed.
_Avoid_: renderer (for export), generator

**Parser gate**:
The CI test that runs each Exporter on a fixture Resume and asserts the output parses in the expected linear order (`pdftotext` for PDF, string-order for DOCX/TXT, optionally an open-source parser). Engineering verification that keeps the export promise. Ships no UI.
_Avoid_: ATS test (for this), validation

**ATS check**:
The deferred user-facing feature that lints the user's own content (missing contact info, empty sections, unparseable dates, overlong bullets). A later phase, distinct from the Parser gate.
_Avoid_: linter, validation (loosely)

**Export preview**:
The user-facing "what you'll get" surface, rendered through the actual PDF exporter (not the editing canvas), so preview equals output. Distinct from the editing canvas, which is HTML/DOM because TipTap requires real DOM.
_Avoid_: print view
