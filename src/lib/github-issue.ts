import type { BUG_AREAS } from "./forms/bug-report";
import type { FEATURE_LAYERS } from "./forms/feature-request";
import type { FeedbackPayload } from "./forms/feedback";

export const GITHUB_REPO = "rimzzlabs/lanjut";

const NEW_ISSUE_URL = `https://github.com/${GITHUB_REPO}/issues/new`;
const TITLE_SUBJECT_MAX_LENGTH = 72;

export interface BugReportIssue {
  title: string;
  whatHappened: string;
  area: (typeof BUG_AREAS)[number];
}

export interface FeatureRequestIssue {
  title: string;
  problem: string;
  layer: (typeof FEATURE_LAYERS)[number];
}

export function areaForPathname(pathname: string): (typeof BUG_AREAS)[number] {
  if (pathname.startsWith("/platform/editor")) return "Editor";
  if (pathname.startsWith("/platform")) return "Dashboard / library";
  if (pathname === "/") return "Landing page";
  return "Other";
}

/** Issue title from a report's first line, marked as coming from the app. */
export function issueTitle(prefix: string, summaryLine: string): string {
  const subject = summaryLine
    .replace(/^- /, "")
    .trim()
    .slice(0, TITLE_SUBJECT_MAX_LENGTH);
  return `${prefix} ${subject}`;
}

/**
 * GitHub prefills issue-form fields from query params keyed by the field ids
 * in the matching .github/ISSUE_TEMPLATE/*.yml; keep the param names in sync
 * with those files. Body fields are markdown strings; GitHub renders the
 * textareas as GFM.
 */
function buildIssueUrl(params: Record<string, string>): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value) search.set(key, value);
  }
  return `${NEW_ISSUE_URL}?${search.toString()}`;
}

export function buildBugReportUrl(issue: BugReportIssue): string {
  return buildIssueUrl({
    template: "bug-report.yml",
    title: issue.title,
    "what-happened": issue.whatHappened,
    area: issue.area,
    browser: navigator.userAgent,
  });
}

export function buildFeatureRequestUrl(issue: FeatureRequestIssue): string {
  return buildIssueUrl({
    template: "feature-request.yml",
    title: issue.title,
    problem: issue.problem,
    layer: issue.layer,
  });
}

export interface FeedbackResult {
  ok: boolean;
  url?: string;
}

/** Files the issue server-side on behalf of the reporter; no GitHub account needed. */
export async function submitFeedback(
  payload: FeedbackPayload,
): Promise<FeedbackResult> {
  try {
    const response = await fetch("/api/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!response.ok) return { ok: false };
    const data = (await response.json()) as { url?: string };
    return { ok: true, url: data.url };
  } catch {
    return { ok: false };
  }
}
