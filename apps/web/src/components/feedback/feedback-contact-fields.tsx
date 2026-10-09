import { useTranslations } from "use-intl";
import type { FeedbackControl } from "@/lib/feedback/feedback-form";
import { FEEDBACK_LIMITS } from "@/lib/feedback/feedback-schema";
import { FeedbackTextField } from "./feedback-text-field";

/**
 * Who sent it, when Lanjut posts it for them. The name is optional and
 * public; with it empty, the report is anonymous.
 */
export function FeedbackContactFields(props: { control: FeedbackControl }) {
  const t = useTranslations("feedback");

  return (
    <FeedbackTextField
      control={props.control}
      name="name"
      label={t("name")}
      hint={t("nameHint")}
      placeholder={t("namePlaceholder")}
      maxLength={FEEDBACK_LIMITS.name}
    />
  );
}
