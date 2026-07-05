import type { Step, Tour } from "nextstepjs";

export const LIBRARY_TOUR = "library";
export const TEMPLATE_TOUR = "template";
export const EDITOR_TOUR = "editor";

export type TourName =
  | typeof LIBRARY_TOUR
  | typeof TEMPLATE_TOUR
  | typeof EDITOR_TOUR;

export function tourForPathname(pathname: string): TourName {
  if (pathname.startsWith("/platform/editor")) return EDITOR_TOUR;
  if (pathname.startsWith("/platform/template")) return TEMPLATE_TOUR;
  return LIBRARY_TOUR;
}

const BASE_STEP = {
  icon: null,
  showControls: true,
  showSkip: true,
  pointerPadding: 12,
  pointerRadius: 16,
} satisfies Partial<Step>;

export const TOURS: Tour[] = [
  {
    tour: LIBRARY_TOUR,
    steps: [
      {
        ...BASE_STEP,
        title: "Welcome to Lanjut",
        content:
          "A free, local-first résumé builder. Everything you write stays in this browser — nothing is ever sent to a server.",
      },
      {
        ...BASE_STEP,
        selector: "#tour-sidebar-nav",
        side: "right",
        title: "Get around",
        content:
          "Switch between your dashboard and the template gallery from here.",
      },
      {
        ...BASE_STEP,
        selector: "#tour-create-resume",
        side: "bottom-right",
        title: "Create a résumé",
        content:
          "Start a new résumé from here. You can keep as many as you like.",
      },
      {
        ...BASE_STEP,
        selector: "#tour-search-resume",
        side: "bottom-left",
        title: "Find it later",
        content: "Search your library by title once it grows.",
      },
      {
        ...BASE_STEP,
        selector: "#tour-sidebar-resumes",
        side: "right",
        title: "Your résumés",
        content:
          "Every résumé you create shows up here — pick one to jump into the editor.",
      },
      {
        ...BASE_STEP,
        selector: "#tour-guide",
        side: "right",
        title: "Replay anytime",
        content:
          "Rerun the guide for whichever page you are on with this button.",
      },
    ],
  },
  {
    tour: TEMPLATE_TOUR,
    steps: [
      {
        ...BASE_STEP,
        selector: "#tour-template-grid > :first-child",
        side: "right",
        title: "Browse templates",
        content:
          "Templates change presentation only — typography, spacing, accents. The structure stays linear so ATS parsers can always read your résumé.",
      },
      {
        ...BASE_STEP,
        selector: "#tour-search-template",
        side: "bottom-left",
        title: "Search",
        content: "Look up a template by name.",
      },
      {
        ...BASE_STEP,
        selector: "#tour-sort-template",
        side: "bottom-right",
        title: "Sort",
        content: "Order the gallery by name or by newest.",
      },
    ],
  },
  {
    tour: EDITOR_TOUR,
    steps: [
      {
        ...BASE_STEP,
        selector: "#tour-editor-preview",
        side: "right",
        title: "Live preview",
        content:
          "This paper is your résumé exactly as it will export. It updates as you type and is saved to this browser automatically.",
      },
      {
        ...BASE_STEP,
        selector: "#tour-editor-sections",
        side: "left",
        title: "Fill in your details",
        content:
          "Each section maps to a fixed, ATS-parseable structure. Work top to bottom.",
      },
      {
        ...BASE_STEP,
        selector: "#tour-download",
        side: "bottom-right",
        title: "Download",
        content:
          "Export as PDF, DOCX, or plain text when you are ready to apply.",
      },
    ],
  },
];
