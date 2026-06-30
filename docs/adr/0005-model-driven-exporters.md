# All exports are pure functions over the document model, not DOM scrapes

PDF, DOCX, and TXT are each produced by an Exporter that takes the structural document model + Presentation tokens and emits the format directly. PDF uses a client-side React→PDF renderer (`@react-pdf/renderer`); DOCX uses a model→docx mapper (the `docx` library); TXT is trivial model serialization. The editing canvas (HTML/DOM, required by TipTap) is a separate renderer; the user's "Export preview" is rendered through the real PDF exporter so preview equals output.

## Considered Options

- **Rejected — print-CSS (`window.print`):** single-source layout and real text, but only covers PDF, has fragile page-break/margin control, and hands the file to the browser dialog. DOCX/TXT must iterate the model regardless, so PDF-via-print would be a one-off that unifies nothing.
- **Rejected — html2canvas / rasterized PDF:** produces an image with no extractable text. Fatal for ATS.
- **Rejected — server-side headless Chrome:** would send resume content to a server, violating the no-server-storage rule.

## Why

Reading order is the ATS guarantee. A model-driven exporter makes reading order a property of a pure function — testable with `pdftotext`/parser assertions in CI without a browser. One pipeline shape serves all three formats.

## Consequences

- Two render paths (editing canvas vs exporters); they share document model + Presentation tokens but are not pixel-identical. Mitigated by making the Export preview the real exporter.
- `@react-pdf/renderer` and `docx` are new dependencies, added when the export phase begins.
