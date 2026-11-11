import { FeedbackEmail } from "@lanjut/mailing/feedback";
import { createElement } from "react";
import { Resend } from "resend";
import type {
  FeedbackIssue,
  FeedbackOutline,
} from "../src/lib/feedback/feedback-issue";

/** All three are optional. Without one of them, no email goes out. */
export interface NotifyEnv {
  RESEND_API_KEY?: string;
  /** A sender on a domain that Resend has verified. */
  NOTIFY_FROM?: string;
  /** The maintainer's inbox. */
  NOTIFY_TO?: string;
}

interface FiledFeedback {
  issue: FeedbackIssue;
  outline: FeedbackOutline;
  /** The address of the issue on GitHub. */
  url: string;
}

/**
 * Emails the maintainer that the feedback form filed an issue. The form files
 * with the maintainer's own GitHub account, and GitHub does not notify a
 * person of their own issue. A failure is logged and never reaches the
 * reporter: the issue is already filed.
 */
export async function notifyFeedback(
  env: NotifyEnv,
  filed: FiledFeedback,
): Promise<void> {
  if (!env.RESEND_API_KEY || !env.NOTIFY_FROM || !env.NOTIFY_TO) return;

  try {
    const response = await new Resend(env.RESEND_API_KEY).emails.send({
      from: env.NOTIFY_FROM,
      to: env.NOTIFY_TO,
      subject: `New feedback: ${filed.issue.title}`,
      react: createElement(FeedbackEmail, {
        title: filed.issue.title,
        labels: filed.issue.labels,
        url: filed.url,
        ...filed.outline,
      }),
    });
    if (response.error) {
      console.error("Resend rejected the email:", response.error);
    }
  } catch (error) {
    console.error("Email send failed:", error);
  }
}
