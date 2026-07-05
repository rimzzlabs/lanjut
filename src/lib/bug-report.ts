import type { BUG_AREAS } from "./forms/bug-report";

const NEW_ISSUE_URL = "https://github.com/rimzzlabs/lanjut/issues/new";
const TITLE_SUBJECT_MAX_LENGTH = 72;

export interface BugReportIssue {
  title: string;
  whatHappened: string;
  steps: string;
  area: (typeof BUG_AREAS)[number];
}

export function areaForPathname(pathname: string): (typeof BUG_AREAS)[number] {
  if (pathname.startsWith("/platform/editor")) return "Editor";
  if (pathname.startsWith("/platform")) return "Dashboard / library";
  if (pathname === "/") return "Landing page";
  return "Other";
}

/** Issue title from the report's first line, marked as coming from the app. */
export function bugReportTitle(summaryLine: string): string {
  const subject = summaryLine
    .replace(/^- /, "")
    .trim()
    .slice(0, TITLE_SUBJECT_MAX_LENGTH);
  return `fix(bug,via app): ${subject}`;
}

/**
 * GitHub prefills issue-form fields from query params keyed by the field ids
 * in .github/ISSUE_TEMPLATE/bug-report.yml — keep the param names in sync
 * with that file. `whatHappened` and `steps` are markdown strings; GitHub
 * renders those textareas as GFM.
 */
export function buildBugReportUrl(issue: BugReportIssue): string {
  const params = new URLSearchParams({
    template: "bug-report.yml",
    title: issue.title,
    "what-happened": issue.whatHappened,
    area: issue.area,
    browser: navigator.userAgent,
  });
  if (issue.steps) params.set("steps", issue.steps);
  return `${NEW_ISSUE_URL}?${params.toString()}`;
}
