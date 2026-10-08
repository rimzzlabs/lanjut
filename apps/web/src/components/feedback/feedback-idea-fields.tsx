import { Alert, AlertDescription } from "@lanjut/ui/components/alert";
import { FieldGroup } from "@lanjut/ui/components/field";
import { A } from "@mobily/ts-belt";
import { InfoIcon } from "@phosphor-icons/react";
import { useTranslations } from "use-intl";
import type { FeedbackControl } from "@/lib/feedback/feedback-form";
import { FEEDBACK_LIMITS, IDEA_IMPACTS } from "@/lib/feedback/feedback-schema";
import { FeedbackAreaField } from "./feedback-area-field";
import { FeedbackChoiceField } from "./feedback-choice-field";
import { FeedbackRichField } from "./feedback-rich-field";
import { FeedbackSimilarIssues } from "./feedback-similar-issues";
import { FeedbackTextField } from "./feedback-text-field";

/**
 * An idea as a situation first and a solution second, so the maintainer can
 * find the best fix, with how it is handled today and how much it matters.
 */
export function FeedbackIdeaFields(props: { control: FeedbackControl }) {
  const t = useTranslations("feedback");

  return (
    <FieldGroup>
      <Alert>
        <InfoIcon />
        <AlertDescription>{t("scopeNote")}</AlertDescription>
      </Alert>
      <FeedbackTextField
        control={props.control}
        name="title"
        label={t("titleField")}
        hint={t("titleHint")}
        placeholder={t("titlePlaceholderIdea")}
        maxLength={FEEDBACK_LIMITS.title}
        required
      >
        <FeedbackSimilarIssues control={props.control} />
      </FeedbackTextField>
      <FeedbackAreaField control={props.control} label={t("area")} />
      <FeedbackRichField
        control={props.control}
        name="goal"
        label={t("goal")}
        hint={t("goalHint")}
        placeholder={t("goalPlaceholder")}
        required
      />
      <FeedbackRichField
        control={props.control}
        name="idea"
        label={t("idea")}
        placeholder={t("ideaPlaceholder")}
        required
      />
      <FeedbackRichField
        control={props.control}
        name="workaround"
        label={t("workaround")}
        placeholder={t("workaroundPlaceholder")}
      />
      <FeedbackChoiceField
        control={props.control}
        name="impact"
        legend={t("impact")}
        options={A.map(IDEA_IMPACTS, (value) => ({
          value,
          label: t(`impacts.${value}`),
        }))}
      />
    </FieldGroup>
  );
}
