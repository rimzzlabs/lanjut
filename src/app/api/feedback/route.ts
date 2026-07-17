import { getCloudflareContext } from "@opennextjs/cloudflare";
import {
  type FeedbackPayload,
  feedbackPayloadSchema,
} from "@/lib/forms/feedback";
import { GITHUB_REPO, issueTitle } from "@/lib/github-issue";

declare global {
  interface CloudflareEnv {
    GITHUB_ISSUE_TOKEN?: string;
    TURNSTILE_SECRET_KEY?: string;
  }
}

const TURNSTILE_VERIFY_URL =
  "https://challenges.cloudflare.com/turnstile/v0/siteverify";
const GITHUB_ISSUES_URL = `https://api.github.com/repos/${GITHUB_REPO}/issues`;

async function verifyTurnstile(
  secret: string,
  token: string,
  remoteIp: string | null,
): Promise<boolean> {
  const body = new FormData();
  body.set("secret", secret);
  body.set("response", token);
  if (remoteIp) body.set("remoteip", remoteIp);

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
      body: [
        "### What happened?",
        payload.whatHappened,
        "### Area",
        payload.area,
        "### Browser and OS",
        browser ?? "_Unknown._",
        reportedBy(payload.name),
      ].join("\n\n"),
    };
  }

  return {
    title: issueTitle("feat(via app):", payload.summary),
    labels: ["enhancement"],
    body: [
      "### What problem does this solve?",
      payload.problem,
      "### Which layer does this touch?",
      payload.layer,
      reportedBy(payload.name),
    ].join("\n\n"),
  };
}

export async function POST(request: Request) {
  const { env } = getCloudflareContext();
  const githubToken = env.GITHUB_ISSUE_TOKEN;
  const turnstileSecret = env.TURNSTILE_SECRET_KEY;
  if (!githubToken || !turnstileSecret) {
    return Response.json({ error: "feedback-disabled" }, { status: 503 });
  }

  let payload: FeedbackPayload;
  try {
    payload = feedbackPayloadSchema.parse(await request.json());
  } catch {
    return Response.json({ error: "invalid-payload" }, { status: 400 });
  }

  const human = await verifyTurnstile(
    turnstileSecret,
    payload.turnstileToken,
    request.headers.get("cf-connecting-ip"),
  );
  if (!human) {
    return Response.json({ error: "verification-failed" }, { status: 403 });
  }

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
  if (!response.ok) {
    return Response.json({ error: "github-error" }, { status: 502 });
  }

  const created = (await response.json()) as { html_url?: string };
  return Response.json({ url: created.html_url }, { status: 201 });
}
