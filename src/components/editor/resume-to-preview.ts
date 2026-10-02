import { A, O, pipe, S } from "@mobily/ts-belt";
import { resolveFont } from "@/lib/fonts";
import { RESUME_LABELS } from "@/lib/resume/labels";
import { type RichBlock, tiptapToRichBlocks } from "@/lib/resume/rich-content";
import {
  getSectionSchema,
  isReorderableSection,
  type ReorderableSectionType,
} from "@/lib/resume/schema-registry";
import type { Field, Resume, Section } from "@/lib/resume/types";
import { joinPresent } from "@/lib/utils";
import { localizeDateValue } from "./month-year-menu/month-year-menu-data";
import type {
  ContactKind,
  ContactView,
  CustomSectionView,
  ExperienceItemView,
  HeaderView,
  ResumePreview,
  SectionHeadings,
} from "./resume-preview";
import { byRecency } from "./resume-sort";

function plain(field: Field | undefined): string {
  return field?.kind === "plain" ? S.trim(field.value) : "";
}

function richBlocks(field: Field | undefined): ReadonlyArray<RichBlock> {
  if (field?.kind !== "richtext") return [];
  return tiptapToRichBlocks(field.value);
}

function sectionOfType(
  resume: Resume,
  type: Section["type"],
): O.Option<Section> {
  return A.find(resume.sections, (section) => section.type === type);
}

/** A stored URL is domain-only (see `UrlInput`); restore the scheme for links. */
function withHttps(value: string): string {
  return /^https?:\/\//i.test(value) ? value : `https://${value}`;
}

/** Document line height bounded to 1.2..2, or null for the template baseline. */
function clampLineHeight(value: number | undefined): number | null {
  if (value == null) return null;
  return Math.min(2, Math.max(1.2, value));
}

/** Font-size multiplier, defaulting to 1 and bounded to the editor's range. */
function clampScale(value: number | undefined): number {
  return Math.min(1.2, Math.max(0.8, value ?? 1));
}

/**
 * A stored title equal to the registry default means "never renamed": it
 * renders as the document-language label, which is how language switching
 * relabels headings. Anything else is a deliberate rename (via the Code tab)
 * and wins over the language label.
 */
function effectiveHeading(
  resume: Resume,
  type: keyof SectionHeadings,
  fallback: string,
): string {
  const title = O.mapWithDefault(sectionOfType(resume, type), "", (section) =>
    S.trim(section.title),
  );
  if (!title || title === getSectionSchema(type).defaultTitle) return fallback;
  return title;
}

function linkContact(kind: ContactKind): (value: string) => ContactView {
  return (value) => {
    const url = withHttps(value);
    return { kind, value: url, href: url };
  };
}

// Links show the full URL (scheme included): a bare domain isn't recognized as
// a link by résumé parsers, which look for http(s)://, www., or a path.
const CONTACT_VIEWS: Record<ContactKind, (value: string) => ContactView> = {
  phone: (value) => ({
    kind: "phone",
    value,
    href: `tel:${S.replaceByRe(value, /\s+/g, "")}`,
  }),
  email: (value) => ({ kind: "email", value, href: `mailto:${value}` }),
  website: linkContact("website"),
  linkedin: linkContact("linkedin"),
  link: linkContact("link"),
  location: (value) => ({ kind: "location", value }),
};

function toHeaderView(resume: Resume): HeaderView {
  const fields = resume.header.fields;
  const fullName = joinPresent(
    [plain(fields.firstName), plain(fields.lastName)],
    " ",
  );

  const location = joinPresent(
    [plain(fields.city), plain(fields.province), plain(fields.country)],
    ", ",
  );
  const rawContacts: ReadonlyArray<readonly [ContactKind, string]> = [
    ["phone", plain(fields.phone)],
    ["email", plain(fields.email)],
    ["website", plain(fields.website)],
    ["linkedin", plain(fields.linkedin)],
    ["link", plain(fields.link)],
    ["location", location],
  ];
  const contacts = pipe(
    rawContacts,
    A.reject(([, value]) => S.isEmpty(value)),
    A.map(([kind, value]) => CONTACT_VIEWS[kind](value)),
  );

  return {
    fullName,
    headline: plain(fields.jobTitle),
    photo: resume.header.photo,
    photoSize: resume.photoSize ?? 56,
    photoRadius: resume.photoRadius ?? 0,
    photoAlign: resume.photoAlign ?? "top",
    contacts,
    showIcons: resume.showIcons ?? true,
  };
}

function customBody(section: Section): ReadonlyArray<RichBlock> {
  if ((section.variant ?? "rich") !== "rich") return [];
  return O.mapWithDefault(A.head(section.entries), [], (entry) =>
    richBlocks(entry.fields.body),
  );
}

// Custom list entries keep document order (no recency sort): they are freeform
// and often carry no dates.
function customEntries(section: Section): ReadonlyArray<ExperienceItemView> {
  if (section.variant !== "list") return [];
  return A.map(section.entries, (entry) => ({
    id: entry.id,
    role: plain(entry.fields.title),
    company: plain(entry.fields.subtitle),
    startDate: plain(entry.fields.startDate),
    endDate: plain(entry.fields.endDate),
    description: richBlocks(entry.fields.description),
  }));
}

/**
 * True when a preview carries no user content: an untouched document that would
 * render as a blank sheet. Callers surface a placeholder instead of the empty page.
 */
export function isResumePreviewEmpty(preview: ResumePreview): boolean {
  const { header } = preview;
  return (
    !header.fullName &&
    !header.headline &&
    A.isEmpty(header.contacts) &&
    A.isEmpty(preview.summary) &&
    A.isEmpty(preview.experience) &&
    A.isEmpty(preview.organizations) &&
    A.isEmpty(preview.education) &&
    A.isEmpty(preview.certificates) &&
    A.isEmpty(preview.skills) &&
    A.isEmpty(preview.languages) &&
    A.isEmpty(preview.customSections)
  );
}

/**
 * Projects the persisted `Resume` onto the `ResumePreview` view-model the "Awal"
 * template renders. This is the single Resume → presentation seam: preview
 * components never read the storage schema directly.
 */
export function resumeToPreview(resume: Resume): ResumePreview {
  const summary = pipe(
    sectionOfType(resume, "summary"),
    O.filter((section) => !section.hidden),
    O.flatMap((section) => A.head(section.entries)),
    O.mapWithDefault([], (entry) => richBlocks(entry.fields.body)),
  );
  const labels = RESUME_LABELS[resume.language];
  const localizeDates = <T extends { startDate: string; endDate: string }>(
    item: T,
  ): T => ({
    ...item,
    startDate: localizeDateValue(item.startDate, labels.months, labels.present),
    endDate: localizeDateValue(item.endDate, labels.months, labels.present),
  });

  // Hidden sections drop out of the emitted order entirely, so no renderer
  // (preview, PDF, docx, plain text) ever sees their heading or entries.
  const sectionOrder = pipe(
    resume.sections,
    A.filter(
      (section) => isReorderableSection(section.type) && !section.hidden,
    ),
    A.map((section) => ({
      type: section.type as ReorderableSectionType,
      id: section.id,
    })),
  );

  const customSections: ReadonlyArray<CustomSectionView> = pipe(
    resume.sections,
    A.filter((section) => section.type === "custom"),
    A.map((section) => ({
      id: section.id,
      title: section.title,
      variant: section.variant ?? "rich",
      body: customBody(section),
      entries: A.map(customEntries(section), localizeDates),
    })),
  );

  const skillsShowProficiency = O.mapWithDefault(
    sectionOfType(resume, "skills"),
    true,
    (section) => section.showProficiency ?? true,
  );
  const languagesShowProficiency = O.mapWithDefault(
    sectionOfType(resume, "languages"),
    true,
    (section) => section.showProficiency ?? true,
  );

  const headings: SectionHeadings = {
    summary: effectiveHeading(resume, "summary", labels.summary),
    experience: effectiveHeading(resume, "experience", labels.experience),
    internship: effectiveHeading(resume, "internship", labels.internship),
    projects: effectiveHeading(resume, "projects", labels.projects),
    organizations: effectiveHeading(
      resume,
      "organizations",
      labels.organizations,
    ),
    education: effectiveHeading(resume, "education", labels.education),
    certifications: effectiveHeading(
      resume,
      "certifications",
      labels.certificates,
    ),
    skills: effectiveHeading(resume, "skills", labels.skills),
    languages: effectiveHeading(resume, "languages", labels.languages),
  };

  return {
    language: resume.language,
    // Clamped so a hand-edited document can adjust spacing but never push a
    // heading gap negative (-24 cancels the 24-unit baseline exactly).
    sectionSpacing: Math.min(60, Math.max(-24, resume.sectionSpacing ?? 0)),
    font: resolveFont(resume.font)?.id ?? null,
    // Clamps guard hand-edited documents: tracking outside -0.5..0.5 breaks
    // PDF text extraction (word boundaries merge or split), and out-of-range
    // line heights break layout.
    letterSpacing: Math.min(0.5, Math.max(-0.5, resume.letterSpacing ?? 0)),
    lineHeight: clampLineHeight(resume.lineHeight),
    // Clamped so a hand-edited document keeps template proportions readable.
    nameScale: clampScale(resume.nameScale),
    titleScale: clampScale(resume.titleScale),
    bodyScale: clampScale(resume.bodyScale),
    headings,
    sectionOrder,
    customSections,
    header: toHeaderView(resume),
    summary,
    experience: pipe(
      sectionOfType(resume, "experience"),
      O.mapWithDefault([], (section) => section.entries),
      A.map((entry) => {
        const website = plain(entry.fields.website);
        return {
          id: entry.id,
          role: plain(entry.fields.title),
          company: plain(entry.fields.company),
          companyHref: website ? withHttps(website) : undefined,
          location: plain(entry.fields.location),
          companyContext: plain(entry.fields.companyContext),
          startDate: plain(entry.fields.startDate),
          endDate: plain(entry.fields.endDate),
          description: richBlocks(entry.fields.description),
        };
      }),
      A.sort(byRecency),
      A.map(localizeDates),
    ),
    internship: pipe(
      sectionOfType(resume, "internship"),
      O.mapWithDefault([], (section) => section.entries),
      A.map((entry) => {
        const website = plain(entry.fields.website);
        return {
          id: entry.id,
          role: plain(entry.fields.title),
          company: plain(entry.fields.company),
          companyHref: website ? withHttps(website) : undefined,
          location: plain(entry.fields.location),
          companyContext: plain(entry.fields.companyContext),
          startDate: plain(entry.fields.startDate),
          endDate: plain(entry.fields.endDate),
          description: richBlocks(entry.fields.description),
        };
      }),
      A.sort(byRecency),
      A.map(localizeDates),
    ),
    projects: pipe(
      sectionOfType(resume, "projects"),
      O.mapWithDefault([], (section) => section.entries),
      A.map((entry) => {
        const website = plain(entry.fields.website);
        return {
          id: entry.id,
          role: plain(entry.fields.title),
          roleHref: website ? withHttps(website) : undefined,
          company: plain(entry.fields.company),
          startDate: plain(entry.fields.startDate),
          endDate: plain(entry.fields.endDate),
          description: richBlocks(entry.fields.description),
        };
      }),
      A.sort(byRecency),
      A.map(localizeDates),
    ),
    organizations: pipe(
      sectionOfType(resume, "organizations"),
      O.mapWithDefault([], (section) => section.entries),
      A.map((entry) => ({
        id: entry.id,
        role: plain(entry.fields.role),
        company: plain(entry.fields.organization),
        startDate: plain(entry.fields.startDate),
        endDate: plain(entry.fields.endDate),
        description: richBlocks(entry.fields.description),
      })),
      A.sort(byRecency),
      A.map(localizeDates),
    ),
    education: pipe(
      sectionOfType(resume, "education"),
      O.mapWithDefault([], (section) => section.entries),
      A.map((entry) => ({
        id: entry.id,
        degree: plain(entry.fields.degree),
        institution: plain(entry.fields.institution),
        location: plain(entry.fields.location),
        startDate: plain(entry.fields.startDate),
        endDate: plain(entry.fields.endDate),
        details: richBlocks(entry.fields.details),
      })),
      A.sort(byRecency),
      A.map(localizeDates),
    ),
    certificates: pipe(
      sectionOfType(resume, "certifications"),
      O.mapWithDefault([], (section) => section.entries),
      A.map((entry) => {
        const url = plain(entry.fields.url);
        return {
          id: entry.id,
          title: plain(entry.fields.name),
          issuer: plain(entry.fields.issuer),
          href: url ? withHttps(url) : undefined,
          startDate: "",
          endDate: "",
        };
      }),
    ),
    // Hiding proficiency is presentation-only: blank it here, the single view
    // chokepoint, so every downstream renderer (preview, PDF, docx, plain text)
    // drops it without threading a flag through each one.
    skills: pipe(
      sectionOfType(resume, "skills"),
      O.mapWithDefault([], (section) => section.entries),
      A.map((entry) => ({
        id: entry.id,
        name: plain(entry.fields.name),
        proficiency: skillsShowProficiency ? plain(entry.fields.level) : "",
      })),
    ),
    skillsColumns: O.mapWithDefault(
      sectionOfType(resume, "skills"),
      2,
      (section) => section.columns ?? 2,
    ),
    languages: pipe(
      sectionOfType(resume, "languages"),
      O.mapWithDefault([], (section) => section.entries),
      A.map((entry) => ({
        id: entry.id,
        name: plain(entry.fields.name),
        proficiency: languagesShowProficiency ? plain(entry.fields.level) : "",
      })),
    ),
    languagesColumns: O.mapWithDefault(
      sectionOfType(resume, "languages"),
      2,
      (section) => section.columns ?? 2,
    ),
  };
}
