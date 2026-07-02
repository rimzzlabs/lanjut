import type { JSONContent } from "@tiptap/core";
import type { Field, Resume, Section } from "@/lib/resume/types";
import { dateSortValue } from "./month-year-menu/month-year-menu-data";
import type { ContactView, HeaderView, ResumePreview } from "./resume-preview";

function plain(field: Field | undefined): string {
  return field?.kind === "plain" ? field.value.trim() : "";
}

function rich(field: Field | undefined): JSONContent | undefined {
  return field?.kind === "richtext" ? field.value : undefined;
}

function sectionOfType(
  resume: Resume,
  type: Section["type"],
): Section | undefined {
  return resume.sections.find((section) => section.type === type);
}

/** All text nodes under `node`, concatenated in document order. */
function nodeText(node: JSONContent | undefined): string {
  if (!node) return "";
  let text = node.text ?? "";
  for (const child of node.content ?? []) text += nodeText(child);
  return text;
}

/**
 * Flattens a restricted TipTap doc into linear text lines: every list item and
 * every top-level paragraph becomes one line. Inline marks (bold/italic/link)
 * collapse to their text — the plain-string view-model carries structure, not
 * formatting. Rendering marks in the preview is separate follow-up work.
 */
function richLines(doc: JSONContent | undefined): string[] {
  const lines: string[] = [];
  for (const block of doc?.content ?? []) {
    if (block.type === "bulletList" || block.type === "orderedList") {
      for (const item of block.content ?? []) {
        const text = nodeText(item).trim();
        if (text) lines.push(text);
      }
      continue;
    }
    const text = nodeText(block).trim();
    if (text) lines.push(text);
  }
  return lines;
}

/** A stored URL is domain-only (see `UrlInput`); restore the scheme for links. */
function withHttps(value: string): string {
  return /^https?:\/\//i.test(value) ? value : `https://${value}`;
}

/** `a === b` first guards against `Infinity - Infinity` (NaN) for ongoing dates. */
function compareDesc(a: number, b: number): number {
  return a === b ? 0 : b - a;
}

/**
 * Orders dated entries newest-first: end date descending, then start date. An
 * ongoing ("Present") or undated entry ranks as the most recent, so a just-added
 * row surfaces at the top until the user dates it.
 */
function byRecency(
  a: { startDate: string; endDate: string },
  b: { startDate: string; endDate: string },
): number {
  const end = compareDesc(dateSortValue(a.endDate), dateSortValue(b.endDate));
  if (end !== 0) return end;
  return compareDesc(dateSortValue(a.startDate), dateSortValue(b.startDate));
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
    contacts.push({
      kind: "website",
      value: website,
      href: withHttps(website),
    });
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
 * Projects the persisted `Resume` onto the `ResumePreview` view-model the "Awal"
 * template renders. This is the single Resume → presentation seam: preview
 * components never read the storage schema directly.
 */
export function resumeToPreview(resume: Resume): ResumePreview {
  const summaryBody = sectionOfType(resume, "summary")?.entries[0]?.fields.body;

  return {
    header: toHeaderView(resume),
    summary: richLines(rich(summaryBody)).join(" "),
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
          highlights: richLines(rich(entry.fields.description)),
        };
      })
      .sort(byRecency),
    education: (sectionOfType(resume, "education")?.entries ?? [])
      .map((entry) => ({
        id: entry.id,
        degree: plain(entry.fields.degree),
        institution: plain(entry.fields.institution),
        startDate: plain(entry.fields.startDate),
        endDate: plain(entry.fields.endDate),
      }))
      .sort(byRecency),
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
    languages: (sectionOfType(resume, "languages")?.entries ?? []).map(
      (entry) => ({
        id: entry.id,
        name: plain(entry.fields.name),
        proficiency: plain(entry.fields.level),
      }),
    ),
  };
}
