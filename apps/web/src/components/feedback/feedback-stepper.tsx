import { cn } from "@lanjut/ui/lib/utils";
import { CheckIcon } from "@phosphor-icons/react";
import { useTranslations } from "use-intl";
import {
  FEEDBACK_STEP_NUMBER,
  FEEDBACK_STEPS,
  type FeedbackStep,
} from "./feedback-steps";

interface FeedbackStepperProps {
  current: FeedbackStep;
  onStepChange: (step: FeedbackStep) => void;
}

/** The three steps in order. A finished step leads back to itself. */
export function FeedbackStepper(props: FeedbackStepperProps) {
  const t = useTranslations("feedback");

  return (
    <ol aria-label={t("stepsLabel")} className="flex items-center gap-2">
      {FEEDBACK_STEPS.map((step) => (
        <FeedbackStepperItem
          key={step}
          step={step}
          current={props.current}
          onStepChange={props.onStepChange}
        />
      ))}
    </ol>
  );
}

function FeedbackStepperItem(props: {
  step: FeedbackStep;
  current: FeedbackStep;
  onStepChange: (step: FeedbackStep) => void;
}) {
  const number = FEEDBACK_STEP_NUMBER[props.step];
  const reached = number <= FEEDBACK_STEP_NUMBER[props.current];

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
      <FeedbackStepLabel
        step={props.step}
        current={props.current}
        onStepChange={props.onStepChange}
      />
    </li>
  );
}

// Every step is one button through all its states, so a click that moves the
// flow never removes the focused element. Later steps stay disabled.
function FeedbackStepLabel(props: {
  step: FeedbackStep;
  current: FeedbackStep;
  onStepChange: (step: FeedbackStep) => void;
}) {
  const t = useTranslations("feedback");
  const number = FEEDBACK_STEP_NUMBER[props.step];
  const currentNumber = FEEDBACK_STEP_NUMBER[props.current];
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
      {done && (
        <span className="grid size-6 place-items-center rounded-full bg-primary text-primary-foreground">
          <CheckIcon weight="bold" className="size-3.5" />
        </span>
      )}
      {!done && (
        <span
          className={cn(
            "grid size-6 place-items-center rounded-full border text-xs tabular-nums",
            current && "border-primary text-primary",
          )}
        >
          {number}
        </span>
      )}
      {t(`steps.${props.step}`)}
    </button>
  );
}
