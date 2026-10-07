import { A, G, O, pipe, S } from "@mobily/ts-belt";
import appCss from "@/styles/globals.css?inline";
import { SQUARE_BULLET_FAMILY } from "./takumi-fonts";

// takumi-pdf 0.15 draws solid borders only. Dotted and dashed rules become a
// repeated SVG segment under a transparent border.
function svg(body: string, size: string): string {
  return encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" ${size}>${body}</svg>`,
  );
}

// neutral-600 at the opacity each rule uses in the preview.
const DOT = svg(
  '<rect width="1" height="1" fill="#525252" fill-opacity="0.4"/>',
  'width="2" height="1"',
);
const DASH = svg(
  '<rect width="3" height="1" fill="#525252" fill-opacity="0.5"/>',
  'width="6" height="1"',
);

// takumi-pdf 0.15 drops :where() selectors and the margin-block-end longhand,
// which every Tailwind space-y utility uses. Each one is restated as a plain
// bottom margin.
const SPACE_Y_CSS = pipe(
  appCss,
  S.match(/\.space-y-[\d\\.]+(?=\s*>\s*:not\(:last-child\)\))/g),
  O.getWithDefault<ReadonlyArray<O.Option<string>>>([]),
  A.filter(G.isString),
  A.uniq,
  A.map((selector) => {
    const step = pipe(
      selector,
      S.replace(".space-y-", ""),
      S.replace("\\", ""),
    );
    return `[data-resume-flow] ${selector}>:not(:last-child){margin-bottom:calc(var(--spacing) * ${step})}`;
  }),
  A.join("\n"),
);

// The preview pins its ink colors on the page frame (see ResumePage); the flow
// has no frame, so it pins them itself. Ligatures stay off so fi and fl extract
// as separate letters for résumé parsers. Letter spacing from template
// tracking classes is dropped: the PDF places each spaced letter on its own,
// and parsers then read "S U M M A R Y" instead of the heading. No catalog font
// ships a face above 700, and takumi-pdf strokes the 700 face to fake heavier
// weights where a browser uses it as it is. No catalog font has a square glyph
// either, so a square list sets its "•" in Square Bullet, whose "•" is a square:
// the marker stays visible text for parsers, with no image or hidden glyph.
const PDF_CSS = `
[data-resume-flow] {
  --foreground: var(--color-neutral-950);
  --muted-foreground: var(--color-neutral-600);
  font-variant-ligatures: none;
}
[data-atomic="true"],
[data-keep="true"] {
  break-inside: avoid;
}
[data-resume-flow] [class*="tracking-"] {
  letter-spacing: 0;
}
[data-resume-flow] .border-dotted,
[data-resume-flow] .border-dashed {
  border-color: transparent;
  background-repeat: repeat-x;
}
[data-resume-flow] .border-dotted {
  background-image: url("data:image/svg+xml,${DOT}");
  background-size: 2px 1px;
}
[data-resume-flow] .border-dashed {
  background-image: url("data:image/svg+xml,${DASH}");
  background-size: 6px 1px;
}
[data-resume-flow] .border-t {
  background-position: left top;
}
[data-resume-flow] .border-b {
  background-position: left bottom;
}
[data-resume-flow] .font-extrabold,
[data-resume-flow] .font-black {
  font-weight: 700;
}
[data-resume-flow] ul,
[data-resume-flow] ol {
  list-style: none;
}
[data-resume-flow] [class*="list-[square]"] ul [data-list-marker] {
  font-family: "${SQUARE_BULLET_FAMILY}";
  font-weight: 400;
  font-style: normal;
}
${SPACE_Y_CSS}
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
