import { A } from "@mobily/ts-belt";
import {
  type FeedbackPayload,
  feedbackPayloadSchema,
} from "../src/lib/forms/feedback";
import { GITHUB_REPO, issueTitle } from "../src/lib/github-issue";
import type { Env } from "./index";

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

interface IssueRequest {
  title: string;
  body: string;
  labels: string[];
}

function reportedBy(name: string): string {
  return `---\n\n_Reported by **${name}** from the in-app feedback form; filed on their behalf by the maintainer._`;
}

function buildIssue(
  payload: FeedbackPayload,
  browser: string | null,
): IssueRequest {
  if (payload.kind === "bug") {
    return {
      title: issueTitle("fix(bug,via app):", payload.summary),
      labels: ["bug"],
      body: A.join(
        [
          "### What happened?",
          payload.whatHappened,
          "### Area",
          payload.area,
          "### Browser and OS",
          payload.client ?? browser ?? "_Unknown._",
          reportedBy(payload.name),
        ],
        "\n\n",
      ),
    };
  }

  return {
    title: issueTitle("feat(via app):", payload.summary),
    labels: ["enhancement"],
    body: A.join(
      [
        "### What problem does this solve?",
        payload.problem,
        "### Which layer does this touch?",
        payload.layer,
        reportedBy(payload.name),
      ],
      "\n\n",
    ),
  };
}

async function readPayload(request: Request): Promise<FeedbackPayload> {
  try {
    return feedbackPayloadSchema.parse(await request.json());
  } catch {
    throw new FeedbackError("invalid-payload", 400);
  }
}

/** Files the report as a GitHub issue and returns its URL. */
export async function fileFeedback(request: Request, env: Env) {
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

  const issue = buildIssue(payload, request.headers.get("user-agent"));
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
  return created.html_url;
}
