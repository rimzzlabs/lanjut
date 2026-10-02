import appCss from "@/styles/globals.css?inline";

// The preview pins its ink colors on the page frame (see ResumePage); the flow
// has no frame, so it pins them itself. Ligatures stay off so fi and fl extract
// as separate letters for résumé parsers. Letter spacing from template
// tracking classes is dropped: the PDF places each spaced letter on its own,
// and parsers then read "S U M M A R Y" instead of the heading.
const PDF_CSS = `
[data-resume-flow] {
  --foreground: var(--color-neutral-950);
  --muted-foreground: var(--color-neutral-600);
  font-variant-ligatures: none;
}
[data-atomic="true"] {
  break-inside: avoid;
}
[data-resume-flow] [class*="tracking-"] {
  letter-spacing: 0;
}
`;

/** The app's compiled stylesheet followed by the PDF-only rules. */
export const RESUME_PDF_CSS: ReadonlyArray<string> = [appCss, PDF_CSS];
