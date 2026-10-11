import { A, D, O, pipe } from "@mobily/ts-belt";
import type { Entry, Header, Resume, Section } from "..";
import { type ResumeContent, resumeToInterchange } from "./codec";
import { OPTIONAL_SETTINGS, presentSettings } from "./import-file";
import { resumeToJson } from "./json";
import { type InterchangeFormat, parseInterchangeText } from "./paste";
import { interchangeToMarkdown } from "./resume-md-write";
import { type ParseInterchangeResult, validateInterchange } from "./validate";
import { resumeToYaml } from "./yaml";

/** Markdown holds the header and the sections. YAML and JSON hold the settings too. */
export type CodeFormat = "markdown" | InterchangeFormat;

function withoutPhoto(resume: Resume): Resume {
  return { ...resume, header: D.deleteKey(resume.header, "photo") };
}

/** The photo stays out: its data URL is too long to edit. */
export function resumeToCodeText(resume: Resume, format: CodeFormat): string {
  const source = withoutPhoto(resume);
  if (format === "json") return resumeToJson(source);
  if (format === "yaml") return resumeToYaml(source);
  return interchangeToMarkdown(resumeToInterchange(source));
}

function keepPhoto(header: Header, previous: Header): Header {
  if (header.photo || !previous.photo) return header;
  return { ...header, photo: previous.photo };
}

function withEntryIds(
  entries: ReadonlyArray<Entry>,
  previous: ReadonlyArray<Entry>,
): ReadonlyArray<Entry> {
  return A.mapWithIndex(entries, (index, entry) =>
    O.mapWithDefault(A.get(previous, index), entry, (old) => ({
      ...entry,
      id: old.id,
    })),
  );
}

function isCustom(section: Section): boolean {
  return section.type === "custom";
}

/**
 * The preview measures and animates its blocks by id, so a parsed section
 * takes the id of the one it replaces: a core section by type, a custom one
 * by its place among the custom ones, and an entry by its index.
 */
function withSectionIds(
  sections: ReadonlyArray<Section>,
  previous: ReadonlyArray<Section>,
): ReadonlyArray<Section> {
  const customs = A.filter(sections, isCustom);
  const previousCustoms = A.filter(previous, isCustom);
  const previousOf = (section: Section) => {
    if (!isCustom(section)) {
      return A.find(previous, (item) => item.type === section.type);
    }
    return pipe(
      A.getIndexBy(customs, (item) => item === section),
      O.flatMap((index) => A.get(previousCustoms, index)),
    );
  };
  return A.map(sections, (section) =>
    O.mapWithDefault(previousOf(section), section, (old) => ({
      ...section,
      id: old.id,
      entries: withEntryIds(section.entries, old.entries),
    })),
  );
}

/**
 * A setting that the text leaves out goes back to its default, as in an
 * import. The title, the template, the language, and the photo stay.
 */
export function applyContentToResume(
  resume: Resume,
  content: ResumeContent,
): Resume {
  return {
    ...D.deleteKeys(resume, OPTIONAL_SETTINGS),
    title: content.title || resume.title,
    templateId: content.templateId ?? resume.templateId,
    language: content.language ?? resume.language,
    showIcons: content.showIcons ?? true,
    sectionSpacing: content.sectionSpacing ?? 0,
    letterSpacing: content.letterSpacing ?? 0,
    header: keepPhoto(content.header, resume.header),
    sections: withSectionIds(content.sections, resume.sections),
    ...presentSettings(content),
  };
}

function sameContent(a: Resume, b: Resume): boolean {
  if (a.header.photo !== b.header.photo) return false;
  const key = (resume: Resume) =>
    JSON.stringify(resumeToInterchange(withoutPhoto(resume)));
  return key(a) === key(b);
}

export interface CodeEdit {
  parsed: ParseInterchangeResult;
  /** The same object as the input when the text is invalid or changes nothing. */
  resume: Resume;
  /** Blocks of Markdown with no field in their section. They are left out. */
  ignored: number;
}

interface ApplyCodeTextParams {
  resume: Resume;
  text: string;
  format: CodeFormat;
}

type CodeRead = Pick<CodeEdit, "parsed" | "ignored">;

// comark loads with the first Markdown text, so YAML and JSON never pay for it.
// A load that fails (the app is offline, say) reads as an error, not a crash.
async function readMarkdown(resume: Resume, text: string): Promise<CodeRead> {
  try {
    const { markdownToInterchange } = await import("./resume-md-read");
    const base = resumeToInterchange(withoutPhoto(resume));
    const read = await markdownToInterchange(text, base);
    return { parsed: validateInterchange(read.doc), ignored: read.ignored };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { parsed: { ok: false, kind: "syntax", message }, ignored: 0 };
  }
}

function readCodeText(
  params: ApplyCodeTextParams,
): Promise<CodeRead> | CodeRead {
  const { resume, text, format } = params;
  if (format === "markdown") return readMarkdown(resume, text);
  return { parsed: parseInterchangeText(text, format), ignored: 0 };
}

export async function applyCodeText(
  params: ApplyCodeTextParams,
): Promise<CodeEdit> {
  const { resume } = params;
  const { parsed, ignored } = await readCodeText(params);
  if (!parsed.ok) return { parsed, resume, ignored };
  const next = applyContentToResume(resume, parsed.content);
  if (sameContent(next, resume)) return { parsed, resume, ignored };
  return { parsed, resume: next, ignored };
}
