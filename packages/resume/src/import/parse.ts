import { A, F, G, O, pipe, S } from "@mobily/ts-belt";
import { createEmptyResume, type Resume, type ResumeLanguage } from "..";
import { detectHeading, type HeadingMatch } from "./headings";
import { DATE_RANGE_RE } from "./parse-entry-split";
import { fillHeader, isContactLine } from "./parse-header";
import { BULLET_RE } from "./parse-rich-lines";
import { type Block, fillBlock } from "./parse-sections";

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
 */
function reassembleLines(
  rawLines: ReadonlyArray<string>,
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
function blockHeading(
  line: string,
  seenRecognizedHeading: boolean,
): HeadingMatch | null {
  if (S.isEmpty(S.trim(line))) return null;
  const heading = detectHeading(line);
  if (heading?.type === "custom" && !seenRecognizedHeading) return null;
  return heading;
}

function appendLine(line: string) {
  return (block: Block): Block => ({
    ...block,
    lines: A.append(block.lines, line),
  });
}

function splitBlocks(lines: ReadonlyArray<string>): ReadonlyArray<Block> {
  const initial: BlockSplit = {
    blocks: [{ heading: null, lines: [] }],
    seenRecognizedHeading: false,
  };
  const split = A.reduce(lines, initial, (acc, line) => {
    const heading = blockHeading(line, acc.seenRecognizedHeading);
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
 * cannot place as leftovers rather than guessing.
 */
export function parseResumeText(text: string, opts: ParseOptions): ParseResult {
  const base: Resume = {
    ...createEmptyResume(opts.title),
    language: opts.language,
    templateId: opts.templateId,
  };
  const lines = reassembleLines(
    pipe(text, S.splitByRe(/\r?\n/), A.filter(G.isString)),
  );
  const blocks = splitBlocks(lines);
  const preamble = pipe(
    A.head(blocks),
    O.filter((block) => block.heading === null),
    O.match(
      (block): ReadonlyArray<string> => block.lines,
      () => [],
    ),
  );
  const header = fillHeader({ resume: base, preamble, allText: text });
  const resume = A.reduce(blocks, header.resume, fillBlock);
  return { resume, leftovers: F.toMutable(header.leftovers) };
}
