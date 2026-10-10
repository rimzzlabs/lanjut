import type { Entry, Field, Resume } from "@lanjut/resume";
import { importResumeFromPdf } from "@lanjut/resume/import";
import { SEED_RESUME } from "@lanjut/resume/seed";
import { TEMPLATES, type TemplateId } from "@lanjut/resume/templates";
import { A, D, G, O, pipe, S } from "@mobily/ts-belt";
import { resumeToPreview } from "@/components/editor/resume-to-preview";
import {
  loadTakumiRenderer,
  type TakumiRenderer,
} from "./load-takumi-renderer";

// Fields a template's PDF does not print, so no import can bring them back.
// Awal prints a project's name without its link.
const NOT_PRINTED: Partial<Record<TemplateId, ReadonlyArray<string>>> = {
  awal: ["projects.website"],
};

type FieldTexts = Record<string, string>;

function richText(node: unknown): string {
  if (!G.isObject(node)) return "";
  const { text, content } = node as { text?: unknown; content?: unknown };
  const children = G.isArray(content)
    ? pipe(content, A.map(richText), A.join(""))
    : "";
  if (G.isString(text)) return `${text}${children}`;
  return `${children} `;
}

// Lower case, because templates set some text in capitals and a PDF keeps
// only the capitals. Addresses compare without their scheme.
function comparable(field: Field | undefined): string {
  if (field === undefined) return "";
  const text = field.kind === "plain" ? field.value : richText(field.value);
  return pipe(
    text,
    S.replaceByRe(/https?:\/\//g, ""),
    S.replaceByRe(/\/(?=\s|$)/g, ""),
    S.replaceByRe(/\s+/g, " "),
    S.trim,
    S.toLowerCase,
  );
}

function textsOf(fields: Record<string, Field>): FieldTexts {
  return pipe(
    D.toPairs(fields),
    A.map(([key, field]) => [key, comparable(field)] as const),
    A.filter(([, text]) => S.isNotEmpty(text)),
    D.fromPairs,
  );
}

function agreement(expected: FieldTexts, actual: FieldTexts): number {
  return pipe(
    D.toPairs(expected),
    A.filter(([key, text]) => actual[key] === text),
    A.length,
  );
}

interface Matching {
  used: ReadonlyArray<number>;
  errors: ReadonlyArray<string>;
}

interface SectionCheck {
  type: string;
  expected: ReadonlyArray<Entry>;
  actual: ReadonlyArray<Entry>;
  skip: ReadonlyArray<string>;
  label: string;
}

/**
 * Each expected entry against the imported entry that agrees with it most.
 * The PDF lists entries by date, which need not be the order they are stored
 * in.
 */
function sectionErrors(check: SectionCheck): ReadonlyArray<string> {
  const actual = A.map(check.actual, (entry) => textsOf(entry.fields));
  return A.reduce(
    check.expected,
    { used: [], errors: [] } as Matching,
    (acc, entry): Matching => {
      const expected = textsOf(entry.fields);
      const best = pipe(
        actual,
        A.mapWithIndex((index, texts) => ({
          index,
          score: agreement(expected, texts),
        })),
        A.reject(({ index }) => A.includes(acc.used, index)),
        A.sort((a, b) => b.score - a.score),
        A.head,
      );
      const matched = O.mapWithDefault(best, {} as FieldTexts, ({ index }) =>
        O.getWithDefault(A.get(actual, index), {} as FieldTexts),
      );
      const errors = pipe(
        D.toPairs(expected),
        A.reject(([key]) => A.includes(check.skip, `${check.type}.${key}`)),
        A.filter(([key, text]) => matched[key] !== text),
        A.map(
          ([key, text]) =>
            `${check.label}: ${check.type}.${key} "${S.slice(text, 0, 60)}" came back as "${S.slice(matched[key] ?? "", 0, 60)}"`,
        ),
      );
      return {
        used: O.mapWithDefault(best, acc.used, ({ index }) =>
          A.append(acc.used, index),
        ),
        errors: A.concat(acc.errors, errors),
      };
    },
  ).errors;
}

function headerErrors(
  expected: Resume,
  actual: Resume,
  label: string,
): ReadonlyArray<string> {
  const want = textsOf(expected.header.fields);
  const got = textsOf(actual.header.fields);
  return pipe(
    D.toPairs(want),
    A.filter(([key, text]) => got[key] !== text),
    A.map(
      ([key, text]) =>
        `${label}: header.${key} "${text}" came back as "${got[key] ?? ""}"`,
    ),
  );
}

async function roundTrip(
  takumi: TakumiRenderer,
  template: TemplateId,
): Promise<ReadonlyArray<string>> {
  const label = `IMPORT round trip (${template})`;
  const pdf = await takumi.render({
    preview: resumeToPreview(SEED_RESUME),
    template,
    readFile: takumi.readFontFile,
  });
  const result = await importResumeFromPdf(pdf, {
    title: SEED_RESUME.title,
    language: SEED_RESUME.language,
    templateId: template,
  });
  if (!result.ok) return [`${label}: the import failed (${result.reason})`];
  const skip = NOT_PRINTED[template] ?? [];
  const errors = A.concat(
    headerErrors(SEED_RESUME, result.resume, label),
    A.flatMap(SEED_RESUME.sections, (section) =>
      sectionErrors({
        type: section.type,
        expected: section.entries,
        actual: pipe(
          result.resume.sections,
          A.find((other) => other.type === section.type),
          O.mapWithDefault(
            [] as ReadonlyArray<Entry>,
            (other) => other.entries,
          ),
        ),
        skip,
        label,
      }),
    ),
  );
  console.log(
    `${label}: ${A.isEmpty(errors) ? "every printed field comes back" : "FAILED"}`,
  );
  return errors;
}

/**
 * Exports the sample résumé with every template, imports each PDF, and
 * compares every field the template prints. Text formatting such as bold is
 * not compared: a PDF's text layer does not carry it.
 */
export async function runImportChecks(): Promise<ReadonlyArray<string>> {
  const takumi = await loadTakumiRenderer();
  try {
    const errors = await Promise.all(
      A.map(TEMPLATES, (summary) => roundTrip(takumi, summary.id)),
    );
    return A.flat(errors);
  } finally {
    await takumi.close();
  }
}
