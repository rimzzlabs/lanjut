import { Button } from "@lanjut/ui/components/button";
import { SheetFooter } from "@lanjut/ui/components/sheet";
import {
  CaretLeftIcon,
  CaretRightIcon,
  PlusIcon,
  XIcon,
} from "@phosphor-icons/react";
import type { MouseEvent } from "react";
import { useTranslations } from "use-intl";
import {
  type CreateStep,
  NEXT_STEP,
  PREVIOUS_STEP,
} from "./platform-resume-create-steps";

interface PlatformResumeCreateFooterProps {
  step: CreateStep;
  canAdvance: boolean;
  submitting: boolean;
  onCancel: () => void;
  onStepChange: (step: CreateStep) => void;
}

/**
 * Back (Cancel on the first step) and Next (Create on the last). Each stays one
 * element through every step and only changes its content: removing the
 * focused button would hand focus back to the sheet itself.
 */
export function PlatformResumeCreateFooter(
  props: PlatformResumeCreateFooterProps,
) {
  const first = props.step === "start";
  const last = props.step === "review";

  function onSecondary() {
    if (first) {
      props.onCancel();
      return;
    }
    props.onStepChange(PREVIOUS_STEP[props.step]);
  }

  function onPrimary(event: MouseEvent<HTMLButtonElement>) {
    if (last) return;
    // The step change turns this button into Create while the click is still
    // in flight. Cancelling the click keeps the browser from submitting.
    event.preventDefault();
    props.onStepChange(NEXT_STEP[props.step]);
  }

  return (
    <SheetFooter className="mt-0 flex-row items-center border-t">
      <Button type="button" variant="outline" onClick={onSecondary}>
        <SecondaryLabel first={first} />
      </Button>
      <Button
        type={last ? "submit" : "button"}
        className="ml-auto"
        disabled={last ? props.submitting : !props.canAdvance}
        onClick={onPrimary}
      >
        <PrimaryLabel last={last} />
      </Button>
    </SheetFooter>
  );
}

function SecondaryLabel(props: { first: boolean }) {
  const t = useTranslations("forms.common");

  if (props.first) {
    return (
      <>
        <XIcon /> {t("cancel")}
      </>
    );
  }
  return (
    <>
      <CaretLeftIcon /> {t("back")}
    </>
  );
}

function PrimaryLabel(props: { last: boolean }) {
  const t = useTranslations("forms.create");
  const tc = useTranslations("forms.common");

  if (props.last) {
    return (
      <>
        <PlusIcon /> {t("submit")}
      </>
    );
  }
  return (
    <>
      {tc("next")} <CaretRightIcon data-icon="inline-end" />
    </>
  );
}
