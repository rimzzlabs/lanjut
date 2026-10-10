import { A, F, G, O, pipe, S } from "@mobily/ts-belt";
import { createEmptyResume, type Resume, type ResumeLanguage } from "..";
import type { TemplateId } from "../templates";
import { detectHeading, type HeadingMatch } from "./headings";
import type { PdfLink } from "./links";
import { DATE_RANGE_RE } from "./parse-entry-split";
import { fillHeader, isContactLine } from "./parse-header";
import { BULLET_RE, isLinkLine, type LinkLineRules } from "./parse-rich-lines";
import { type Block, fillBlock, type ParseState } from "./parse-sections";

export interface ParseOptions {
  title: string;
  language: ResumeLanguage;
  templateId: string;
}

export interface ParseResult {
  resume: Resume;
  /** Text the parser could not confidently place into the structured document. */
  leftovers: string[];
}

// --- entry point -----------------------------------------------------------

/**
 * Rejoin soft-wrapped lines. PDF text extraction breaks a paragraph or bullet at
 * every visual line, so a single sentence arrives as several lines. A line is a
 * continuation of the previous one when it does not start a new bullet, heading,
 * dated header, or contact, the previous line did not end a sentence, and it
 * either starts lowercase or completes a hyphenated word split. Merging these
 * keeps a wrapped bullet as one item and stops a fragment being read as a header.
 * Nothing joins a section heading, and a line that is all one link's text, such
 * as a project named "pg-jobs", stands alone.
 */
function reassembleLines(
  rawLines: ReadonlyArray<string>,
  labels: ReadonlySet<string>,
): ReadonlyArray<string> {
  const initial: ReadonlyArray<string> = [];
  return A.reduce(rawLines, initial, (result, raw) => {
    const line = S.trim(raw);
    if (S.isEmpty(line)) return result;
    const prev = A.last(result);
    const isContinuation =
      O.isSome(prev) &&
      !BULLET_RE.test(line) &&
      !DATE_RANGE_RE.test(line) &&
      !isContactLine(line) &&
      !isLinkLine(line) &&
      !labels.has(line) &&
      detectHeading(prev) === null &&
      !/[.!?:]$/.test(prev) &&
      (/^[a-z]/.test(line) || /[-–—]$/.test(prev));
    if (!isContinuation) return A.append(result, line);
    const lastIdx = A.length(result) - 1;
    if (/[-–—]$/.test(prev)) {
      return A.replaceAt(
        result,
        lastIdx,
        S.replaceByRe(prev, /[-–—]$/, "") + line,
      );
    }
    return A.replaceAt(result, lastIdx, `${prev} ${line}`);
  });
}

interface BlockSplit {
  blocks: ReadonlyArray<Block>;
  seenRecognizedHeading: boolean;
}

// Everything before the first recognized section is the preamble (name,
// contacts, location). A custom (all-caps) heading there is really the name,
// so custom headings are only honored once a recognized section has started.
// A line of contacts or links is never a heading, though a word in it can
// match one: "Portfolio" in "GitHub | Portfolio", "about" in a URL. Nor is a
// capitalized entry: a template can set "PRESIDENT 2016 – 2018" in capitals,
// and a line with a date range, or one that is all one link's text such as a
// certificate name, is an entry rather than a custom section.
function blockHeading(
  line: string,
  seenRecognizedHeading: boolean,
  rules: LinkLineRules,
): HeadingMatch | null {
  if (S.isEmpty(S.trim(line))) return null;
  if (isContactLine(line) || isLinkLine(line, rules)) return null;
  const heading = detectHeading(line);
  if (heading?.type !== "custom") return heading;
  if (!seenRecognizedHeading) return null;
  if (DATE_RANGE_RE.test(line) || rules.labels.has(S.trim(line))) return null;
  return heading;
}

function appendLine(line: string) {
  return (block: Block): Block => ({
    ...block,
    lines: A.append(block.lines, line),
  });
}

function splitBlocks(
  lines: ReadonlyArray<string>,
  rules: LinkLineRules,
): ReadonlyArray<Block> {
  const initial: BlockSplit = {
    blocks: [{ heading: null, lines: [] }],
    seenRecognizedHeading: false,
  };
  const split = A.reduce(lines, initial, (acc, line) => {
    const heading = blockHeading(line, acc.seenRecognizedHeading, rules);
    if (heading === null) {
      const lastIdx = A.length(acc.blocks) - 1;
      return {
        ...acc,
        blocks: A.updateAt(acc.blocks, lastIdx, appendLine(line)),
      };
    }
    return {
      blocks: A.append(acc.blocks, { heading, lines: [] }),
      seenRecognizedHeading:
        acc.seenRecognizedHeading || heading.type !== "custom",
    };
  });
  return split.blocks;
}

/**
 * Parse extracted résumé text into a structured document. Conservative by
 * design: fills only high-confidence data (contacts, dates, section text),
 * routes unrecognized headings to custom sections, and returns anything it
 * cannot place as leftovers rather than guessing. `links` are the PDF's own
 * links, which put each address in a link field instead of the text.
 */
export function parseResumeText(
  text: string,
  opts: ParseOptions,
  links: ReadonlyArray<PdfLink> = [],
  source?: TemplateId,
): ParseResult {
  const base: Resume = {
    ...createEmptyResume(opts.title),
    language: opts.language,
    templateId: opts.templateId,
  };
  const labels: ReadonlySet<string> = new Set(
    pipe(
      links,
      A.map((link) => link.label),
      A.reject(S.isEmpty),
    ),
  );
  const lines = reassembleLines(
    pipe(text, S.splitByRe(/\r?\n/), A.filter(G.isString)),
    labels,
  );
  const blocks = splitBlocks(lines, { labels, bareDomains: true });
  const preamble = pipe(
    A.head(blocks),
    O.filter((block) => block.heading === null),
    O.match(
      (block): ReadonlyArray<string> => block.lines,
      () => [],
    ),
  );
  const header = fillHeader({ resume: base, preamble, allText: text, links });
  const initial: ParseState = {
    resume: header.resume,
    leftovers: header.leftovers,
  };
  const parsed = A.reduce(
    blocks,
    initial,
    fillBlock({ links, headerUrls: header.urls, source }),
  );
  return { resume: parsed.resume, leftovers: F.toMutable(parsed.leftovers) };
}
