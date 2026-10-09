import { FieldGroup } from "@lanjut/ui/components/field";
import { A } from "@mobily/ts-belt";
import { useTranslations } from "use-intl";
import type { FeedbackControl } from "@/lib/feedback/feedback-form";
import {
  FEEDBACK_LIMITS,
  WORDING_LANGUAGES,
} from "@/lib/feedback/feedback-schema";
import { FeedbackAreaField } from "./feedback-area-field";
import { FeedbackChoiceField } from "./feedback-choice-field";
import { FeedbackRichField } from "./feedback-rich-field";
import { FeedbackTextField } from "./feedback-text-field";

/**
 * A wrong word: the text exactly as it is, so it can be found, and the
 * better wording when the reporter knows it. The title is made from the text.
 */
export function FeedbackWordingFields(props: { control: FeedbackControl }) {
  const t = useTranslations();

  return (
    <FieldGroup>
      <FeedbackChoiceField
        control={props.control}
        name="language"
        legend={t("feedback.language")}
        options={A.map(WORDING_LANGUAGES, (value) => ({
          value,
          label: t(`language.${value}`),
        }))}
      />
      <FeedbackTextField
        control={props.control}
        name="current"
        label={t("feedback.current")}
        hint={t("feedback.currentHint")}
        placeholder={t("feedback.currentPlaceholder")}
        rows={2}
        maxLength={FEEDBACK_LIMITS.short}
        required
      />
      <FeedbackTextField
        control={props.control}
        name="suggested"
        label={t("feedback.suggested")}
        hint={t("feedback.suggestedHint")}
        placeholder={t("feedback.suggestedPlaceholder")}
        rows={2}
        maxLength={FEEDBACK_LIMITS.short}
      />
      <FeedbackAreaField control={props.control} label={t("feedback.where")} />
      <FeedbackRichField
        control={props.control}
        name="note"
        label={t("feedback.note")}
        placeholder={t("feedback.notePlaceholder")}
      />
    </FieldGroup>
  );
}
