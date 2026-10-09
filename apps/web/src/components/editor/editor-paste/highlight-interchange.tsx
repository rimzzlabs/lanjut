import type { InterchangeFormat } from "@lanjut/resume/interchange/paste";
import { highlightCode, tagHighlighter, tags } from "@lezer/highlight";
import { parser as jsonParser } from "@lezer/json";
import { parser as yamlParser } from "@lezer/yaml";
import type { ReactNode } from "react";

const PARSERS = { json: jsonParser, yaml: yamlParser };

// YAML has no separate number or boolean token: its plain values read as
// content, in the string color.
const SYNTAX = tagHighlighter([
  { tag: tags.propertyName, class: "text-syntax-key" },
  { tag: [tags.string, tags.content], class: "text-syntax-string" },
  { tag: tags.number, class: "text-syntax-number" },
  {
    tag: [tags.bool, tags.null, tags.labelName, tags.typeName, tags.keyword],
    class: "text-syntax-literal",
  },
  {
    tag: [
      tags.separator,
      tags.brace,
      tags.squareBracket,
      tags.special(tags.string),
      tags.meta,
    ],
    class: "text-muted-foreground",
  },
  { tag: tags.lineComment, class: "text-muted-foreground italic" },
]);

/** The text as colored runs, parsed by the grammar of its format. */
export function highlightInterchange(
  text: string,
  format: InterchangeFormat,
): ReadonlyArray<ReactNode> {
  // highlightCode reports each run through a callback, so the runs are
  // collected into an array as it walks the text.
  const runs: ReactNode[] = [];
  highlightCode(
    text,
    PARSERS[format].parse(text),
    SYNTAX,
    (code, classes) => {
      if (!classes) {
        runs.push(code);
        return;
      }
      runs.push(
        <span key={runs.length} className={classes}>
          {code}
        </span>,
      );
    },
    () => {
      runs.push("\n");
    },
  );
  return runs;
}
