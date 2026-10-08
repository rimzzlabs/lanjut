import { cn } from "@lanjut/ui/lib/utils";
import { CheckIcon } from "@phosphor-icons/react";
import { useTranslations } from "use-intl";
import {
  CREATE_STEP_LABEL_KEYS,
  CREATE_STEP_NUMBER,
  CREATE_STEPS,
  type CreateStep,
} from "./platform-resume-create-steps";

interface PlatformResumeCreateStepperProps {
  current: CreateStep;
  onStepChange: (step: CreateStep) => void;
}

/** The three steps in order. A finished step leads back to itself. */
export function PlatformResumeCreateStepper(
  props: PlatformResumeCreateStepperProps,
) {
  const t = useTranslations("forms.create");

  return (
    <ol aria-label={t("stepsLabel")} className="flex items-center gap-2">
      {CREATE_STEPS.map((step) => (
        <PlatformResumeCreateStepperItem
          key={step}
          step={step}
          current={props.current}
          onStepChange={props.onStepChange}
        />
      ))}
    </ol>
  );
}

interface PlatformResumeCreateStepperItemProps {
  step: CreateStep;
  current: CreateStep;
  onStepChange: (step: CreateStep) => void;
}

function PlatformResumeCreateStepperItem(
  props: PlatformResumeCreateStepperItemProps,
) {
  const number = CREATE_STEP_NUMBER[props.step];
  const reached = number <= CREATE_STEP_NUMBER[props.current];

  return (
    <li className="flex items-center gap-2">
      {number > 1 && (
        <span
          aria-hidden
          className={cn(
            "h-px w-4 shrink-0 sm:w-8",
            reached ? "bg-primary" : "bg-border",
          )}
        />
      )}
      <StepLabel
        step={props.step}
        current={props.current}
        onStepChange={props.onStepChange}
      />
    </li>
  );
}

// Every step is one button through all its states, so a click that moves the
// flow never removes the focused element. Later steps stay disabled, and the
// current one leaves the tab order, as clicking it does nothing.
function StepLabel(props: PlatformResumeCreateStepperItemProps) {
  const t = useTranslations("forms.create");
  const number = CREATE_STEP_NUMBER[props.step];
  const currentNumber = CREATE_STEP_NUMBER[props.current];
  const done = number < currentNumber;
  const current = number === currentNumber;

  return (
    <button
      type="button"
      disabled={number > currentNumber}
      aria-current={current ? "step" : undefined}
      tabIndex={current ? -1 : undefined}
      onClick={() => {
        if (done) props.onStepChange(props.step);
      }}
      className={cn(
        "flex items-center gap-2 rounded-md text-sm outline-none transition-colors focus-visible:ring-3 focus-visible:ring-ring/50",
        done && "cursor-pointer text-muted-foreground hover:text-foreground",
        current && "cursor-default font-medium text-foreground",
        number > currentNumber && "text-muted-foreground",
      )}
    >
      <StepBadge number={number} done={done} current={current} />
      {t(CREATE_STEP_LABEL_KEYS[props.step])}
    </button>
  );
}

function StepBadge(props: { number: number; done: boolean; current: boolean }) {
  if (props.done) {
    return (
      <span className="grid size-6 place-items-center rounded-full bg-primary text-primary-foreground">
        <CheckIcon weight="bold" className="size-3.5" />
      </span>
    );
  }
  return (
    <span
      className={cn(
        "grid size-6 place-items-center rounded-full border text-xs tabular-nums",
        props.current && "border-primary text-primary",
      )}
    >
      {props.number}
    </span>
  );
}
