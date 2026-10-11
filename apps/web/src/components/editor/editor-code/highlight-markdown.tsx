import { isKnownLabel } from "@lanjut/resume/interchange/resume-md-schema";
import { A, S } from "@mobily/ts-belt";
import { Fragment, type ReactNode } from "react";

const HEADING = /^(#{1,6}\s+)(.*?)(\s*\{[^{}]*\})?$/;
const LABEL = /^([^:\s][^:]{0,39}):(.*)$/;
const MARKER = /^(\s*(?:[-+*]|\d{1,9}[.)])\s)(.*)$/;

// Colors only: the mirror under the textarea must keep each glyph's width.
function highlightLine(line: string): ReactNode {
  const [, hashes, title, attributes] = HEADING.exec(line) ?? [];
  if (hashes !== undefined) {
    return (
      <>
        <span className="text-muted-foreground">{hashes}</span>
        <span className="text-syntax-key">{title}</span>
        <span className="text-syntax-literal">{attributes}</span>
      </>
    );
  }
  const [, label, value] = LABEL.exec(line) ?? [];
  if (label !== undefined && isKnownLabel(label)) {
    return (
      <>
        <span className="text-syntax-string">{label}:</span>
        {value}
      </>
    );
  }
  const [, marker, item] = MARKER.exec(line) ?? [];
  if (marker !== undefined) {
    return (
      <>
        <span className="text-muted-foreground">{marker}</span>
        {item}
      </>
    );
  }
  return line;
}

/** The résumé dialect in color: headings, labels, and list markers. */
export function highlightMarkdown(text: string): ReadonlyArray<ReactNode> {
  const lines = S.split(text, "\n");
  const last = A.length(lines) - 1;
  return A.mapWithIndex(lines, (index, line) => (
    <Fragment key={index}>
      {highlightLine(line)}
      {index < last && "\n"}
    </Fragment>
  ));
}
