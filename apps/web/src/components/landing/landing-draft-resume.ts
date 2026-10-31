import {
  type PlainField,
  type Resume,
  type ResumeLanguage,
  type RichTextField,
  SAMPLE_RESUMES,
  updateSectionOfType,
} from "@lanjut/resume";
import type { TemplateId } from "@lanjut/resume/templates";
import { joinPresent } from "@lanjut/resume/text";
import { A, pipe, S } from "@mobily/ts-belt";
import type { LandingDraft } from "@/lib/store";

/**
 * The landing draft materialized as a full document: the sample resume with
 * the visitor's own name and title layered over it, in the page's language. A typed name also renames
 * the sample contact details, and a typed role swaps the sample summary for a
 * marked placeholder, so nothing on the page reads as someone else's résumé.
 * Used identically by the live preview, the parser read, and the create
 * handoff.
 */
export function draftToResume(
  draft: LandingDraft,
  language: ResumeLanguage,
): Resume {
  const resume = structuredClone(SAMPLE_RESUMES[language]);
  const firstName = S.trim(draft.firstName);
  const lastName = S.trim(draft.lastName);
  const jobTitle = S.trim(draft.jobTitle);
  const handle = nameHandle(firstName, lastName);
  return {
    ...resume,
    header: {
      ...resume.header,
      fields: {
        ...resume.header.fields,
        ...(S.isNotEmpty(firstName) && { firstName: plainField(firstName) }),
        ...(S.isNotEmpty(lastName) && { lastName: plainField(lastName) }),
        ...(S.isNotEmpty(jobTitle) && { jobTitle: plainField(jobTitle) }),
        ...(S.isNotEmpty(handle.dotted) && {
          email: plainField(`${handle.dotted}@example.com`),
          website: plainField(`${handle.compact}.example.com`),
          linkedin: plainField(`linkedin.com/in/${handle.compact}`),
          link: plainField(`github.com/${handle.compact}`),
        }),
      },
    },
    sections: withRoleSummary(resume.sections, jobTitle, language),
  };
}

function withRoleSummary(
  sections: Resume["sections"],
  jobTitle: string,
  language: ResumeLanguage,
) {
  if (S.isEmpty(jobTitle)) return sections;
  return updateSectionOfType("summary", (section) => ({
    ...section,
    entries: A.map(section.entries, (entry) => ({
      ...entry,
      fields: { ...entry.fields, body: sampleSummary(jobTitle, language) },
    })),
  }))(sections);
}

function nameHandle(firstName: string, lastName: string) {
  const parts = pipe(
    [firstName, lastName],
    A.map((part) =>
      pipe(
        part,
        S.toLowerCase,
        (value) => value.normalize("NFD"),
        S.replaceByRe(/[^a-z0-9]+/g, ""),
      ),
    ),
    A.filter(S.isNotEmpty),
  );
  return { dotted: A.join(parts, "."), compact: A.join(parts, "") };
}

const SAMPLE_SUMMARY: Record<ResumeLanguage, (jobTitle: string) => string> = {
  en: (jobTitle) =>
    `Sample summary. Replace it with two or three lines about your work as ${jobTitle}: what you do, and what you have done well.`,
  id: (jobTitle) =>
    `Contoh ringkasan. Ganti dengan dua atau tiga baris tentang pekerjaanmu sebagai ${jobTitle}: apa yang kamu kerjakan, dan apa yang sudah kamu kerjakan dengan baik.`,
};

function sampleSummary(
  jobTitle: string,
  language: ResumeLanguage,
): RichTextField {
  return {
    kind: "richtext",
    value: {
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: SAMPLE_SUMMARY[language](jobTitle),
            },
          ],
        },
      ],
    },
  };
}

function plainField(value: string): PlainField {
  return { kind: "plain", value };
}

export function draftFullName(draft: LandingDraft): string {
  return joinPresent([S.trim(draft.firstName), S.trim(draft.lastName)], " ");
}

export function draftHasContent(draft: LandingDraft): boolean {
  return Boolean(
    S.trim(draft.firstName) || S.trim(draft.lastName) || S.trim(draft.jobTitle),
  );
}

/** Identifies what a parser run checked, so a later edit reads as unchecked. */
export function draftKey(draft: LandingDraft, template: TemplateId): string {
  return A.join(
    [
      S.trim(draft.firstName),
      S.trim(draft.lastName),
      S.trim(draft.jobTitle),
      template,
    ],
    "|",
  );
}
