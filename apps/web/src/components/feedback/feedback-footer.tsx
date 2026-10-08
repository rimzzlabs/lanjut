import { Button } from "@lanjut/ui/components/button";
import { Spinner } from "@lanjut/ui/components/spinner";
import {
  ArrowSquareOutIcon,
  CaretLeftIcon,
  CaretRightIcon,
  PaperPlaneTiltIcon,
} from "@phosphor-icons/react";
import { useTranslations } from "use-intl";
import type { FeedbackDelivery } from "@/lib/feedback/feedback-issue";
import type { FeedbackStep } from "./feedback-steps";

interface FeedbackFooterProps {
  step: FeedbackStep;
  delivery: FeedbackDelivery;
  submitting: boolean;
  /** Absent on the page, where there is nothing to cancel back to. */
  onCancel: (() => void) | undefined;
  onBack: () => void;
}

/**
 * Back (Cancel on the first step) and the primary action: Next, then Send
 * when Lanjut posts it, or Open on GitHub when the reporter posts it. The primary button is the
 * form's submit button on every step, so Enter in a field moves forward.
 */
export function FeedbackFooter(props: FeedbackFooterProps) {
  const t = useTranslations("feedback");
  const first = props.step === "kind";
  const last = props.step === "review";

  return (
    <div className="flex items-center gap-2">
      {first && props.onCancel && (
        <Button type="button" variant="outline" onClick={props.onCancel}>
          {t("cancel")}
        </Button>
      )}
      {!first && (
        <Button type="button" variant="outline" onClick={props.onBack}>
          <CaretLeftIcon data-icon="inline-start" />
          {t("back")}
        </Button>
      )}
      <Button type="submit" className="ml-auto" disabled={props.submitting}>
        <FeedbackPrimaryLabel
          last={last}
          delivery={props.delivery}
          submitting={props.submitting}
        />
      </Button>
    </div>
  );
}

function FeedbackPrimaryLabel(props: {
  last: boolean;
  delivery: FeedbackDelivery;
  submitting: boolean;
}) {
  const t = useTranslations("feedback");

  if (!props.last) {
    return (
      <>
        {t("next")}
        <CaretRightIcon data-icon="inline-end" />
      </>
    );
  }
  if (props.delivery === "github") {
    return (
      <>
        {t("openGitHub")}
        <ArrowSquareOutIcon data-icon="inline-end" />
      </>
    );
  }
  return (
    <>
      {t("send")}
      {props.submitting && <Spinner data-icon="inline-end" />}
      {!props.submitting && <PaperPlaneTiltIcon data-icon="inline-end" />}
    </>
  );
}
