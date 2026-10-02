import { pipe, S } from "@mobily/ts-belt";
import appCss from "@/styles/globals.css?inline";

// takumi-pdf draws solid borders only, and no résumé font has a square glyph:
// dotted and dashed rules print as solid hairlines, and square bullets use an
// SVG marker.
const SQUARE_MARKER = encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="5" height="5"><rect width="5" height="5" fill="#0a0a0a"/></svg>',
);

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
[data-resume-flow] .border-dotted,
[data-resume-flow] .border-dashed {
  border-style: solid;
}
[data-resume-flow] [class*="list-[square]"] ul {
  list-style-image: url("data:image/svg+xml,${SQUARE_MARKER}");
}
`;

// takumi-pdf 0.15 drops a declaration whose var() has whitespace before the
// closing paren or a line break after the opening one, as unminified Tailwind
// output does. Collapse whitespace and trim it inside parentheses.
const COMPACT_APP_CSS = pipe(
  appCss,
  S.replaceByRe(/\s+/g, " "),
  S.replaceByRe(/\(\s+/g, "("),
  S.replaceByRe(/\s+\)/g, ")"),
);

/** The app's compiled stylesheet followed by the PDF-only rules. */
export const RESUME_PDF_CSS: ReadonlyArray<string> = [COMPACT_APP_CSS, PDF_CSS];
