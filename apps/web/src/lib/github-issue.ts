import { pipe, S } from "@mobily/ts-belt";
import type { FeedbackIssue } from "./feedback/feedback-issue";
import type { FeedbackArea, FeedbackPayload } from "./feedback/feedback-schema";
import { EDITOR_PATHNAME, PROFILE_PATHNAME, TEMPLATE_PATHNAME } from "./routes";

export const GITHUB_REPO = "rimzzlabs/lanjut";

const NEW_ISSUE_URL = `https://github.com/${GITHUB_REPO}/issues/new`;

/** Prefilled issue addresses stay well under the length browsers and GitHub accept. */
const FALLBACK_BODY_MAX_LENGTH = 6000;

/** The part of the app a report most likely concerns, from where it was opened. */
export function areaForPathname(
  pathname: string,
  editing: boolean,
): FeedbackArea {
  if (editing) return "editor";
  if (S.startsWith(pathname, TEMPLATE_PATHNAME)) return "templates";
  if (S.startsWith(pathname, EDITOR_PATHNAME)) return "library";
  if (S.startsWith(pathname, PROFILE_PATHNAME)) return "library";
  if (pathname === "/") return "home";
  return "other";
}

/**
 * The new-issue page on GitHub, prefilled with the same title and body the
 * Worker would file. For when direct sending is off; the reporter needs a
 * GitHub account and submits it themselves.
 */
export function buildFallbackIssueUrl(issue: FeedbackIssue): string {
  const search = new URLSearchParams({
    title: issue.title,
    body: pipe(issue.body, S.slice(0, FALLBACK_BODY_MAX_LENGTH)),
  });
  return `${NEW_ISSUE_URL}?${search.toString()}`;
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
