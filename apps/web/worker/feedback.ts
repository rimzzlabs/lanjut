import {
  buildFeedbackIssue,
  buildFeedbackOutline,
} from "../src/lib/feedback/feedback-issue";
import {
  type FeedbackPayload,
  feedbackPayloadSchema,
} from "../src/lib/feedback/feedback-schema";
import { GITHUB_REPO } from "../src/lib/github-issue";
import type { Env } from "./index";
import { notifyFeedback } from "./notify";

const TURNSTILE_VERIFY_URL =
  "https://challenges.cloudflare.com/turnstile/v0/siteverify";
const GITHUB_ISSUES_URL = `https://api.github.com/repos/${GITHUB_REPO}/issues`;

/** A failure the client can act on. The Worker maps it to a JSON response. */
export class FeedbackError extends Error {
  readonly status: number;

  constructor(code: string, status: number) {
    super(code);
    this.status = status;
  }
}

interface TurnstileCheck {
  secret: string;
  token: string;
  remoteIp: string | null;
}

async function verifyTurnstile(check: TurnstileCheck): Promise<boolean> {
  const body = new FormData();
  body.set("secret", check.secret);
  body.set("response", check.token);
  if (check.remoteIp) body.set("remoteip", check.remoteIp);

  const response = await fetch(TURNSTILE_VERIFY_URL, { method: "POST", body });
  if (!response.ok) return false;
  const outcome = (await response.json()) as { success?: boolean };
  return outcome.success === true;
}

async function readPayload(request: Request): Promise<FeedbackPayload> {
  try {
    return feedbackPayloadSchema.parse(await request.json());
  } catch {
    throw new FeedbackError("invalid-payload", 400);
  }
}

interface WaitUntil {
  waitUntil(promise: Promise<unknown>): void;
}

/**
 * Files the report as a GitHub issue and returns its URL. The email to the
 * maintainer goes out after the answer, so the reporter never waits for it.
 */
export async function fileFeedback(
  request: Request,
  env: Env,
  context: WaitUntil,
) {
  const githubToken = env.GITHUB_ISSUE_TOKEN;
  const turnstileSecret = env.TURNSTILE_SECRET_KEY;
  if (!githubToken || !turnstileSecret) {
    throw new FeedbackError("feedback-disabled", 503);
  }

  const payload = await readPayload(request);
  const human = await verifyTurnstile({
    secret: turnstileSecret,
    token: payload.turnstileToken,
    remoteIp: request.headers.get("cf-connecting-ip"),
  });
  if (!human) throw new FeedbackError("verification-failed", 403);

  const issue = buildFeedbackIssue(payload.report, payload.details);
  const response = await fetch(GITHUB_ISSUES_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${githubToken}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "lanjut-feedback",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(issue),
  });
  if (!response.ok) throw new FeedbackError("github-error", 502);

  const created = (await response.json()) as { html_url?: string };
  if (created.html_url) {
    context.waitUntil(
      notifyFeedback(env, {
        issue,
        outline: buildFeedbackOutline(payload.report, payload.details),
        url: created.html_url,
      }),
    );
  }
  return created.html_url;
}
