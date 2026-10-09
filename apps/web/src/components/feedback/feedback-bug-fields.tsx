import { FieldGroup } from "@lanjut/ui/components/field";
import { A } from "@mobily/ts-belt";
import { useTranslations } from "use-intl";
import type { FeedbackControl } from "@/lib/feedback/feedback-form";
import {
  BUG_FREQUENCIES,
  FEEDBACK_LIMITS,
} from "@/lib/feedback/feedback-schema";
import { FeedbackAreaField } from "./feedback-area-field";
import { FeedbackChoiceField } from "./feedback-choice-field";
import { FeedbackRichField } from "./feedback-rich-field";
import { FeedbackSimilarIssues } from "./feedback-similar-issues";
import { FeedbackTextField } from "./feedback-text-field";

/**
 * A bug as the maintainer needs it: a title, where, what was done, what was
 * expected, what happened instead, and how often. The steps come first, so
 * the reporter retraces them before describing the result.
 */
export function FeedbackBugFields(props: { control: FeedbackControl }) {
  const t = useTranslations("feedback");

  return (
    <FieldGroup>
      <FeedbackTextField
        control={props.control}
        name="title"
        label={t("titleField")}
        hint={t("titleHint")}
        placeholder={t("titlePlaceholderBug")}
        maxLength={FEEDBACK_LIMITS.title}
        required
      >
        <FeedbackSimilarIssues control={props.control} />
      </FeedbackTextField>
      <FeedbackAreaField control={props.control} label={t("area")} />
      <FeedbackRichField
        control={props.control}
        name="steps"
        label={t("stepsField")}
        hint={t("stepsHint")}
        placeholder={t("stepsPlaceholder")}
        required
      />
      <FeedbackRichField
        control={props.control}
        name="expected"
        label={t("expected")}
        placeholder={t("expectedPlaceholder")}
        required
      />
      <FeedbackRichField
        control={props.control}
        name="actual"
        label={t("actual")}
        hint={t("actualHint")}
        placeholder={t("actualPlaceholder")}
        required
      />
      <FeedbackChoiceField
        control={props.control}
        name="frequency"
        legend={t("frequency")}
        options={A.map(BUG_FREQUENCIES, (value) => ({
          value,
          label: t(`frequencies.${value}`),
        }))}
      />
    </FieldGroup>
  );
}
