import type { Step } from "nextstepjs";

export const LIBRARY_TOUR = "library";
export const TEMPLATE_TOUR = "template";
export const EDITOR_TOUR = "editor";
export const EDITOR_SHEET_TOUR = "editor-sheet";

export type TourName =
  | typeof LIBRARY_TOUR
  | typeof TEMPLATE_TOUR
  | typeof EDITOR_TOUR
  | typeof EDITOR_SHEET_TOUR;

export interface AppStep extends Step {
  sidebar?: "open" | "closed";
  scrollTop?: boolean;
}

export interface AppTour {
  tour: TourName;
  steps: AppStep[];
}

export function tourForPathname(pathname: string): TourName {
  if (pathname.startsWith("/platform/editor")) return EDITOR_TOUR;
  if (pathname.startsWith("/platform/template")) return TEMPLATE_TOUR;
  return LIBRARY_TOUR;
}

export function getTourStep(
  tourName: string | null,
  stepIndex: number,
): AppStep | undefined {
  const tour = TOURS.find((t) => t.tour === tourName);
  return tour?.steps[stepIndex];
}

const BASE_STEP = {
  icon: null,
  showControls: true,
  showSkip: true,
  pointerPadding: 12,
  pointerRadius: 16,
} satisfies Partial<Step>;

// Library and template targets all sit at the top of a window-scrolled page.
const TOP_STEP = { ...BASE_STEP, scrollTop: true } satisfies Partial<AppStep>;

export const TOURS: AppTour[] = [
  {
    tour: LIBRARY_TOUR,
    steps: [
      {
        ...TOP_STEP,
        sidebar: "closed",
        title: "Welcome to Lanjut",
        content:
          "A free, local-first résumé builder. Everything you write stays in this browser; nothing is ever sent to a server.",
      },
      {
        ...TOP_STEP,
        sidebar: "closed",
        selector: "#tour-create-resume",
        side: "bottom-right",
        title: "Create a résumé",
        content:
          "Start a new résumé from here. You can keep as many as you like.",
      },
      {
        ...TOP_STEP,
        sidebar: "closed",
        selector: "#tour-search-resume",
        side: "bottom-left",
        title: "Find it later",
        content: "Search your library by title once it grows.",
      },
      {
        ...TOP_STEP,
        sidebar: "open",
        selector: "#tour-sidebar-nav",
        side: "right",
        title: "Get around",
        content:
          "Switch between your dashboard and the template gallery from here.",
      },
      {
        ...TOP_STEP,
        sidebar: "open",
        selector: "#tour-sidebar-resumes",
        side: "right",
        title: "Your résumés",
        content:
          "Every résumé you create shows up here; pick one to jump into the editor.",
      },
      {
        ...TOP_STEP,
        sidebar: "open",
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
        ...TOP_STEP,
        sidebar: "closed",
        selector: "#tour-template-grid > :first-child",
        side: "right",
        title: "Browse templates",
        content:
          "Templates change presentation only: typography, spacing, accents. The structure stays linear so ATS parsers can always read your résumé.",
      },
      {
        ...TOP_STEP,
        sidebar: "closed",
        selector: "#tour-search-template",
        side: "bottom-left",
        title: "Search",
        content: "Look up a template by name.",
      },
      {
        ...TOP_STEP,
        sidebar: "closed",
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
  {
    tour: EDITOR_SHEET_TOUR,
    steps: [
      {
        ...BASE_STEP,
        sidebar: "closed",
        title: "Live preview",
        content:
          "This paper is your résumé exactly as it will export. It updates as you type and is saved to this browser automatically.",
      },
      {
        ...BASE_STEP,
        sidebar: "closed",
        selector: "#tour-editor-edit",
        side: "top-right",
        title: "Fill in your details",
        content:
          "Tap Edit to open the section forms. Each section maps to a fixed, ATS-parseable structure.",
      },
    ],
  },
];
