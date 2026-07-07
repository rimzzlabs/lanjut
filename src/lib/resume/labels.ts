import type { ResumeLanguage } from "./types";

export const RESUME_LANGUAGES: ResumeLanguage[] = ["en", "id"];

interface DocumentLabels {
  summary: string;
  experience: string;
  organizations: string;
  education: string;
  certificates: string;
  skills: string;
  languages: string;
  /** End-date label for an ongoing role or study. */
  present: string;
  /** Twelve month abbreviations, indexed 0 (January) to 11 (December). */
  months: string[];
}

/**
 * Fixed labels rendered into the résumé document, per language. Kept separate
 * from the next-intl UI messages: the document's language is its own field, not
 * the app's UI locale.
 */
export const RESUME_LABELS: Record<ResumeLanguage, DocumentLabels> = {
  en: {
    summary: "Summary",
    experience: "Experience",
    organizations: "Organizations",
    education: "Education",
    certificates: "Certificates",
    skills: "Skills",
    languages: "Languages",
    present: "Present",
    months: [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ],
  },
  id: {
    summary: "Ringkasan",
    experience: "Pengalaman",
    organizations: "Organisasi",
    education: "Pendidikan",
    certificates: "Sertifikat",
    skills: "Keahlian",
    languages: "Bahasa",
    present: "Sekarang",
    months: [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "Mei",
      "Jun",
      "Jul",
      "Agu",
      "Sep",
      "Okt",
      "Nov",
      "Des",
    ],
  },
};
