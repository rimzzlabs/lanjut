import { A, pipe, S } from "@mobily/ts-belt";
import type { JSONContent } from "@tiptap/core";
import { useTranslations } from "use-intl";
import {
  type FeedbackFormReport,
  type FeedbackFormValues,
  toFeedbackReport,
} from "@/lib/feedback/feedback-form";
import { buildFeedbackIssue } from "@/lib/feedback/feedback-issue";
import { isRichEmpty } from "@/lib/feedback/feedback-markdown";
import { FeedbackRichText } from "./feedback-rich-text";

type PreviewSection =
  | { key: string; label: string; rich: JSONContent }
  | { key: string; label: string; text: string };

function sectionsOf(
  values: FeedbackFormValues,
  t: (key: string) => string,
): ReadonlyArray<PreviewSection> {
  const all: Record<FeedbackFormValues["kind"], PreviewSection[]> = {
    bug: [
      { key: "steps", label: t("stepsField"), rich: values.steps },
      { key: "expected", label: t("expected"), rich: values.expected },
      { key: "actual", label: t("actual"), rich: values.actual },
    ],
    idea: [
      { key: "goal", label: t("goal"), rich: values.goal },
      { key: "idea", label: t("idea"), rich: values.idea },
      { key: "workaround", label: t("workaround"), rich: values.workaround },
    ],
    wording: [
      { key: "current", label: t("current"), text: values.current },
      { key: "suggested", label: t("suggested"), text: values.suggested },
      { key: "note", label: t("note"), rich: values.note },
    ],
  };
  return pipe(
    all[values.kind],
    A.filter((section) => {
      if ("rich" in section) return !isRichEmpty(section.rich);
      return S.isNotEmpty(S.trim(section.text));
    }),
  );
}

/**
 * The report as it goes to GitHub: the title it will carry and what the
 * reporter wrote, so they can check it before it becomes public.
 */
export function FeedbackReportPreview(props: { values: FeedbackFormValues }) {
  const t = useTranslations("feedback");
  // The form only reaches this step with the fields of its kind valid.
  const report = toFeedbackReport(props.values as FeedbackFormReport);
  const issue = buildFeedbackIssue(report, undefined);

  return (
    <section className="flex flex-col gap-3">
      <h3 className="text-sm font-medium">{t("previewTitle")}</h3>
      <div className="flex flex-col gap-4 rounded-xl bg-muted/40 p-4 ring-1 ring-foreground/10">
        <p className="font-medium">{issue.title}</p>
        {sectionsOf(props.values, t).map((section) => (
          <div key={section.key} className="flex flex-col gap-1">
            <span className="text-xs font-medium text-muted-foreground">
              {section.label}
            </span>
            {"rich" in section && <FeedbackRichText doc={section.rich} />}
            {"text" in section && (
              <p className="text-sm whitespace-pre-wrap wrap-break-word">
                {section.text}
              </p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
