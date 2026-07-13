import type { SectionType } from "@/lib/resume";

/**
 * Bilingual (English + Indonesian) heading keywords per recognized section type.
 * Matching is case-insensitive against short lines only; a document that uses
 * these words as a heading is detected, others fall through to `custom` or body.
 */
const HEADING_KEYWORDS: Array<[SectionType, string[]]> = [
  [
    "summary",
    [
      "summary",
      "professional summary",
      "profile",
      "professional profile",
      "objective",
      "career objective",
      "about",
      "about me",
      "ringkasan",
      "profil",
      "tentang",
      "tentang saya",
      "ikhtisar",
      "objektif",
    ],
  ],
  [
    "experience",
    [
      "experience",
      "work experience",
      "professional experience",
      "employment",
      "employment history",
      "work history",
      "pengalaman",
      "pengalaman kerja",
      "pengalaman profesional",
      "riwayat pekerjaan",
    ],
  ],
  ["internship", ["internship", "internships", "magang", "pengalaman magang"]],
  [
    "projects",
    [
      "projects",
      "project",
      "personal projects",
      "proyek",
      "portofolio",
      "portfolio",
    ],
  ],
  [
    "organizations",
    [
      "organizations",
      "organization",
      "organizational experience",
      "activities",
      "volunteer",
      "volunteering",
      "leadership",
      "organisasi",
      "pengalaman organisasi",
      "kegiatan",
      "kepanitiaan",
      "relawan",
      "kepemimpinan",
    ],
  ],
  [
    "education",
    [
      "education",
      "academic background",
      "academics",
      "pendidikan",
      "riwayat pendidikan",
      "latar belakang pendidikan",
      "akademik",
    ],
  ],
  [
    "certifications",
    [
      "certifications",
      "certification",
      "certificates",
      "licenses",
      "licenses & certifications",
      "sertifikat",
      "sertifikasi",
      "lisensi",
    ],
  ],
  [
    "skills",
    [
      "skills",
      "technical skills",
      "expertise",
      "competencies",
      "core competencies",
      "keahlian",
      "keterampilan",
      "kemampuan",
      "kompetensi",
    ],
  ],
  ["languages", ["languages", "language", "bahasa", "kemampuan bahasa"]],
];

export interface HeadingMatch {
  type: SectionType;
  /** The heading text as it should appear (used as the title of a custom section). */
  title: string;
}

function normalizeHeading(line: string): string {
  return line
    .trim()
    .toLowerCase()
    .replace(/[\s:•·.\-–—|]+$/g, "")
    .trim();
}

/**
 * An all-caps line that reads like a heading rather than a stray acronym.
 * Requires two or more words, or a single word of at least six letters, so
 * short acronyms in body text (AWS, IAAP, IEEE) are not mistaken for headings.
 */
function looksLikeAllCapsHeading(line: string): boolean {
  const letters = line.replace(/[^a-zA-Z]/g, "");
  if (letters.length < 2 || letters !== letters.toUpperCase()) return false;
  return line.trim().split(/\s+/).length >= 2 || letters.length >= 6;
}

function toTitleCase(line: string): string {
  return line
    .toLowerCase()
    .replace(/\b[a-z]/g, (c) => c.toUpperCase())
    .trim();
}

/**
 * Classify a line as a section heading. Returns the recognized section type, or
 * `custom` (with a tidy title) for a heading-like line not in the dictionary, or
 * null for a body line. Deliberately conservative: only short lines qualify, and
 * an unrecognized heading must be all-caps so ordinary title-case body lines are
 * not mistaken for headings.
 */
export function detectHeading(line: string): HeadingMatch | null {
  const trimmed = line.trim();
  if (!trimmed) return null;
  if (trimmed.split(/\s+/).length > 5) return null;
  const norm = normalizeHeading(trimmed);
  if (!norm) return null;

  for (const [type, keywords] of HEADING_KEYWORDS) {
    if (keywords.includes(norm)) return { type, title: trimmed };
  }
  for (const [type, keywords] of HEADING_KEYWORDS) {
    if (keywords.some((keyword) => norm.includes(keyword))) {
      return { type, title: trimmed };
    }
  }
  if (looksLikeAllCapsHeading(trimmed)) {
    return { type: "custom", title: toTitleCase(trimmed) };
  }
  return null;
}
