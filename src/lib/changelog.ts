export interface ChangelogEntry {
  version: string;
  date: string;
  highlights: string[];
}

/**
 * User-facing release notes shown in the "What's new" sheet, newest first.
 * Hand-written in plain language, not generated from commits. Add an entry
 * here as part of each release PR; skip versions with nothing user-visible.
 */
export const CHANGELOG: ChangelogEntry[] = [
  {
    version: "0.6.0",
    date: "2026-07-08",
    highlights: [
      "Reorder your skills and languages: grab the handle next to an entry and drag it into place, or use the keyboard to move it. The new order flows straight into the preview and every export.",
    ],
  },
  {
    version: "0.5.0",
    date: "2026-07-06",
    highlights: [
      "Switch templates without leaving the editor: the new Layout tab shows your résumé rendered in every template, and one click applies your pick.",
      'Start from scratch when you want to: untick "Pre-fill with example content" in the create dialog to begin with a blank document instead of the example résumé.',
      "Sections can now be emptied completely: every entry has a delete button, and removing the last one simply drops the section from the preview until you add another.",
    ],
  },
  {
    version: "0.4.0",
    date: "2026-07-05",
    highlights: [
      "New Organization Experience section: showcase volunteer, student, and community roles with dates and highlights, just like work experience. It shows up in every template and export, and your existing résumés get it automatically.",
      "Your saved résumés are safer during app updates: a backup copy is kept on your device before any data-format upgrade, and a résumé the app can't read yet is flagged with a notice instead of disappearing.",
      "A guided tour now walks you through the dashboard, the templates, and the editor on your first visit.",
      "The landing page walks through how Lanjut works, ending with a one-click way to start a new résumé.",
      "Found a bug or missing a feature? Report it from the sidebar; we prefill the GitHub issue for you.",
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
      "The editor covers the full section set: summary, experience, education, skills, certifications, and languages.",
    ],
  },
];

export const LATEST_CHANGELOG_VERSION = CHANGELOG[0]?.version ?? "";
