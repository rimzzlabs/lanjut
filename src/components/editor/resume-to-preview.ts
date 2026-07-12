import { RESUME_LABELS } from "@/lib/resume/labels";
import {
  isReorderableSection,
  type ReorderableSectionType,
} from "@/lib/resume/schema-registry";
import type { Field, Resume, Section } from "@/lib/resume/types";
import { localizeDateValue } from "./month-year-menu/month-year-menu-data";
import type {
  ContactView,
  CustomSectionView,
  HeaderView,
  ResumePreview,
} from "./resume-preview";
import { byRecency } from "./resume-sort";
import { type RichBlock, tiptapToRichBlocks } from "./rich-content";

function plain(field: Field | undefined): string {
  return field?.kind === "plain" ? field.value.trim() : "";
}

function richBlocks(field: Field | undefined): RichBlock[] {
  return field?.kind === "richtext" ? tiptapToRichBlocks(field.value) : [];
}

function sectionOfType(
  resume: Resume,
  type: Section["type"],
): Section | undefined {
  return resume.sections.find((section) => section.type === type);
}

/** A stored URL is domain-only (see `UrlInput`); restore the scheme for links. */
function withHttps(value: string): string {
  return /^https?:\/\//i.test(value) ? value : `https://${value}`;
}

function toHeaderView(resume: Resume): HeaderView {
  const fields = resume.header.fields;
  const fullName = [plain(fields.firstName), plain(fields.lastName)]
    .filter(Boolean)
    .join(" ");

  const contacts: ContactView[] = [];
  const phone = plain(fields.phone);
  if (phone) {
    contacts.push({
      kind: "phone",
      value: phone,
      href: `tel:${phone.replace(/\s+/g, "")}`,
    });
  }
  const email = plain(fields.email);
  if (email)
    contacts.push({ kind: "email", value: email, href: `mailto:${email}` });
  const website = plain(fields.website);
  if (website) {
    // Show the full URL (scheme included): a bare domain isn't recognized as a
    // link by résumé parsers, which look for http(s)://, www., or a path.
    const url = withHttps(website);
    contacts.push({ kind: "website", value: url, href: url });
  }
  const linkedin = plain(fields.linkedin);
  if (linkedin) {
    const url = withHttps(linkedin);
    contacts.push({ kind: "linkedin", value: url, href: url });
  }
  const location = [
    plain(fields.city),
    plain(fields.province),
    plain(fields.country),
  ]
    .filter(Boolean)
    .join(", ");
  if (location) contacts.push({ kind: "location", value: location });

  return { fullName, headline: plain(fields.jobTitle), contacts };
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
    header.contacts.length === 0 &&
    preview.summary.length === 0 &&
    preview.experience.length === 0 &&
    preview.organizations.length === 0 &&
    preview.education.length === 0 &&
    preview.certificates.length === 0 &&
    preview.skills.length === 0 &&
    preview.languages.length === 0 &&
    preview.customSections.length === 0
  );
}

/**
 * Projects the persisted `Resume` onto the `ResumePreview` view-model the "Awal"
 * template renders. This is the single Resume → presentation seam: preview
 * components never read the storage schema directly.
 */
export function resumeToPreview(resume: Resume): ResumePreview {
  const summaryBody = sectionOfType(resume, "summary")?.entries[0]?.fields.body;
  const labels = RESUME_LABELS[resume.language];
  const localizeDates = <T extends { startDate: string; endDate: string }>(
    item: T,
  ): T => ({
    ...item,
    startDate: localizeDateValue(item.startDate, labels.months, labels.present),
    endDate: localizeDateValue(item.endDate, labels.months, labels.present),
  });

  const sectionOrder = resume.sections
    .filter((section) => isReorderableSection(section.type))
    .map((section) => ({
      type: section.type as ReorderableSectionType,
      id: section.id,
    }));

  const customSections: CustomSectionView[] = resume.sections
    .filter((section) => section.type === "custom")
    .map((section) => {
      const variant = section.variant ?? "rich";
      return {
        id: section.id,
        title: section.title,
        variant,
        body:
          variant === "rich" ? richBlocks(section.entries[0]?.fields.body) : [],
        // Custom list entries keep document order (no recency sort): they are
        // freeform and often carry no dates.
        entries:
          variant === "list"
            ? section.entries
                .map((entry) => ({
                  id: entry.id,
                  role: plain(entry.fields.title),
                  company: plain(entry.fields.subtitle),
                  startDate: plain(entry.fields.startDate),
                  endDate: plain(entry.fields.endDate),
                  description: richBlocks(entry.fields.description),
                }))
                .map(localizeDates)
            : [],
      };
    });

  return {
    language: resume.language,
    sectionOrder,
    customSections,
    header: toHeaderView(resume),
    summary: richBlocks(summaryBody),
    experience: (sectionOfType(resume, "experience")?.entries ?? [])
      .map((entry) => {
        const website = plain(entry.fields.website);
        return {
          id: entry.id,
          role: plain(entry.fields.title),
          company: plain(entry.fields.company),
          companyHref: website ? withHttps(website) : undefined,
          startDate: plain(entry.fields.startDate),
          endDate: plain(entry.fields.endDate),
          description: richBlocks(entry.fields.description),
        };
      })
      .sort(byRecency)
      .map(localizeDates),
    internship: (sectionOfType(resume, "internship")?.entries ?? [])
      .map((entry) => {
        const website = plain(entry.fields.website);
        return {
          id: entry.id,
          role: plain(entry.fields.title),
          company: plain(entry.fields.company),
          companyHref: website ? withHttps(website) : undefined,
          startDate: plain(entry.fields.startDate),
          endDate: plain(entry.fields.endDate),
          description: richBlocks(entry.fields.description),
        };
      })
      .sort(byRecency)
      .map(localizeDates),
    projects: (sectionOfType(resume, "projects")?.entries ?? [])
      .map((entry) => {
        const website = plain(entry.fields.website);
        return {
          id: entry.id,
          role: plain(entry.fields.title),
          company: plain(entry.fields.company),
          companyHref: website ? withHttps(website) : undefined,
          startDate: plain(entry.fields.startDate),
          endDate: plain(entry.fields.endDate),
          description: richBlocks(entry.fields.description),
        };
      })
      .sort(byRecency)
      .map(localizeDates),
    organizations: (sectionOfType(resume, "organizations")?.entries ?? [])
      .map((entry) => ({
        id: entry.id,
        role: plain(entry.fields.role),
        company: plain(entry.fields.organization),
        startDate: plain(entry.fields.startDate),
        endDate: plain(entry.fields.endDate),
        description: richBlocks(entry.fields.description),
      }))
      .sort(byRecency)
      .map(localizeDates),
    education: (sectionOfType(resume, "education")?.entries ?? [])
      .map((entry) => ({
        id: entry.id,
        degree: plain(entry.fields.degree),
        institution: plain(entry.fields.institution),
        startDate: plain(entry.fields.startDate),
        endDate: plain(entry.fields.endDate),
        details: richBlocks(entry.fields.details),
      }))
      .sort(byRecency)
      .map(localizeDates),
    certificates: (sectionOfType(resume, "certifications")?.entries ?? []).map(
      (entry) => {
        const url = plain(entry.fields.url);
        return {
          id: entry.id,
          title: plain(entry.fields.name),
          issuer: plain(entry.fields.issuer),
          href: url ? withHttps(url) : undefined,
          startDate: "",
          endDate: "",
        };
      },
    ),
    skills: (sectionOfType(resume, "skills")?.entries ?? []).map((entry) => ({
      id: entry.id,
      name: plain(entry.fields.name),
      proficiency: plain(entry.fields.level),
    })),
    skillsColumns: sectionOfType(resume, "skills")?.columns ?? 2,
    languages: (sectionOfType(resume, "languages")?.entries ?? []).map(
      (entry) => ({
        id: entry.id,
        name: plain(entry.fields.name),
        proficiency: plain(entry.fields.level),
      }),
    ),
  };
}
