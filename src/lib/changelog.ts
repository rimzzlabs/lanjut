export interface ChangelogEntry {
  version: string;
  date: string;
  highlights: string[];
}

/**
 * User-facing release notes shown in the "What's new" sheet, newest first.
 * Hand-written in plain language — not generated from commits. Add an entry
 * here as part of each release PR; skip versions with nothing user-visible.
 */
export const CHANGELOG: ChangelogEntry[] = [
  {
    version: "0.4.0",
    date: "2026-07-05",
    highlights: [
      "A guided tour now walks you through the dashboard, the templates, and the editor on your first visit.",
      "The landing page walks through how Lanjut works, ending with a one-click way to start a new résumé.",
      "Found a bug or missing a feature? Report it from the sidebar — we prefill the GitHub issue for you.",
      "On your phone, dialogs now open as drawers that are easier to reach and swipe away.",
    ],
  },
  {
    version: "0.3.0",
    date: "2026-07-04",
    highlights: [
      "Browse templates on their own page, with search and sorting.",
      "Five new templates: Ketat, Luasa, Tebal, Klasik, and Ketik.",
      "Template and résumé cards now show a live thumbnail of your actual document.",
      "The sidebar highlights where you are, and each résumé gets a quick actions menu.",
    ],
  },
  {
    version: "0.2.0",
    date: "2026-07-03",
    highlights: [
      "Export your résumé as PDF, DOCX, or plain text.",
      "Bold, italics, links, and lists now show up in the live preview.",
      "The editor covers the full section set — summary, experience, education, skills, certifications, and languages.",
    ],
  },
];

export const LATEST_CHANGELOG_VERSION = CHANGELOG[0]?.version ?? "";
