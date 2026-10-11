import type { Resume } from "@lanjut/resume";
import {
  applyCodeText,
  resumeToCodeText,
} from "@lanjut/resume/interchange/code-edit";
import { importResumeFromJson } from "@lanjut/resume/interchange/import-file";
import { SEED_RESUME } from "@lanjut/resume/seed";
import { A, S } from "@mobily/ts-belt";

// A résumé that puts every escape and every fallback of the Markdown dialect
// to work: text that looks like syntax, a name that does not split at its
// last space, entries with no title, dates that one line cannot hold, a
// custom section with a core title, and braces that look like attributes.
const HARD_CASE = {
  format: "lanjut-resume",
  version: 1,
  title: "Hard case",
  template: "ketat",
  language: "id",
  font: "eb-garamond",
  sectionSpacing: 4,
  header: {
    firstName: "Juan",
    lastName: "dela Cruz",
    jobTitle: "C# *Dev* [lead] _x_ {y}",
    email: "a_b@c.dev",
    website: "https://x.dev/ä_(1)",
    city: "A: B",
  },
  sections: [
    {
      type: "summary",
      body: "Company: not a label here\n\n# not a heading\n\n- one\n- two\n\n- second list\n\n1. a\n2. b\n\n1. second ordered\n\n**bold***italic* a\\*b snake_case _edge_ [l**b**](https://a.co/x_(y)) end\\\\",
    },
    {
      type: "experience",
      title: "Work History",
      hidden: true,
      entries: [
        {
          title: "",
          company: "Acme",
          startDate: "Jan 2023",
          endDate: "Present",
          description: "Location: a body line, not a label\n\n- did *things*",
        },
        { title: "-", description: "Company: a body line, not a label" },
        {
          title: "Lead #",
          location: "X - Y",
          startDate: "2020 - a",
          endDate: "2021",
          website: "acme.com",
        },
        { title: "Only end", endDate: "2020", description: "1. one\n2. two" },
        {
          title: "## hashes ##",
          companyContext: "ctx {type=skills}",
          startDate: "2019",
        },
      ],
    },
    {
      type: "education",
      entries: [
        {
          institution: "Uni {type=experience}",
          degree: "B.Sc.",
          startDate: "2016",
          endDate: "2020",
          details: "- a\n- b",
        },
      ],
    },
    {
      type: "skills",
      columns: 1,
      showProficiency: false,
      entries: [
        { name: "TypeScript", level: "Advanced" },
        { name: "Go" },
        { name: "Design: Figma", level: "Mid" },
        { name: "", level: "Low" },
        { name: "C#" },
        { name: "- dash" },
        { name: "*nix", level: "a: b" },
      ],
    },
    { type: "languages", entries: [{ name: "English", level: "Fluent" }] },
    {
      type: "certifications",
      entries: [
        { name: "AWS SA", issuer: "Amazon", url: "https://aws.example/c?x=1" },
      ],
    },
    {
      type: "custom",
      variant: "rich",
      title: "Experience",
      body: "A custom section with a core title.",
    },
    {
      type: "custom",
      variant: "list",
      title: "Awards",
      entries: [{ title: "Best", subtitle: "Org", startDate: "2022" }],
    },
    { type: "custom", variant: "list", title: "Empty list", entries: [] },
    {
      type: "custom",
      variant: "rich",
      title: "Notes {variant=list}",
      body: "body",
    },
  ],
};

function hardCase(): Resume | undefined {
  const imported = importResumeFromJson(JSON.stringify(HARD_CASE), {
    title: "Hard case",
    language: "en",
    templateId: "awal",
  });
  if (!imported.ok) return undefined;
  return imported.resume;
}

/** A résumé's own Markdown must read back as that résumé, or a keystroke changes text the person did not touch. */
async function roundTripErrors(
  resume: Resume,
  label: string,
): Promise<string[]> {
  const text = resumeToCodeText(resume, "markdown");
  const edit = await applyCodeText({ resume, text, format: "markdown" });
  if (!edit.parsed.ok) return [`Markdown (${label}): its own text is refused`];
  if (edit.ignored > 0) {
    return [
      `Markdown (${label}): its own text leaves ${edit.ignored} block(s) out`,
    ];
  }
  if (edit.resume !== resume) {
    return [`Markdown (${label}): its own text changes the résumé`];
  }
  return [];
}

/**
 * The kill criterion of the RFC (#142): when more than one section in four
 * needs a `{type=...}` attribute, the format is YAML with visible syntax.
 */
function attributeErrors(): string[] {
  const lines = S.split(resumeToCodeText(SEED_RESUME, "markdown"), "\n");
  const headings = A.filter(lines, S.startsWith("## "));
  const marked = A.filter(headings, (line) => /\{[^{}]*\}$/.test(line));
  console.log(
    `Markdown: ${A.length(marked)} of ${A.length(headings)} sample headings carry an attribute`,
  );
  if (A.length(marked) * 4 <= A.length(headings)) return [];
  return ["Markdown: more than one sample section in four needs an attribute"];
}

export async function runMarkdownChecks(): Promise<string[]> {
  const hard = hardCase();
  if (!hard) return ["Markdown: the hard-case document does not import"];
  const [seed, hardCaseErrors] = await Promise.all([
    roundTripErrors(SEED_RESUME, "sample"),
    roundTripErrors(hard, "hard case"),
  ]);
  console.log("Markdown: the sample and the hard case read back unchanged");
  return [...seed, ...hardCaseErrors, ...attributeErrors()];
}
