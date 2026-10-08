import { Button } from "@lanjut/ui/components/button";
import type { CardComponentProps } from "nextstepjs";
import { useEffect, useId, useRef } from "react";
import { useTranslations } from "use-intl";

/**
 * One step of a tour, as a small dialog. The page under it is inert while the
 * tour runs, so focus moves to the primary button on every step: keyboard
 * users keep going with Enter, and screen readers hear the step.
 */
export function TourCard(props: CardComponentProps) {
  const t = useTranslations("tour.controls");
  const titleId = useId();
  const contentId = useId();
  const primaryRef = useRef<HTMLButtonElement>(null);
  const isLastStep = props.currentStep === props.totalSteps - 1;

  // Moving focus into the card is a DOM effect the tour library leaves to us.
  useEffect(() => {
    if (props.currentStep >= 0) primaryRef.current?.focus();
  }, [props.currentStep]);

  return (
    <div
      role="dialog"
      aria-labelledby={titleId}
      aria-describedby={contentId}
      className="w-80 rounded-2xl border bg-popover p-4 text-popover-foreground shadow-lg"
    >
      <h2 id={titleId} className="text-sm font-semibold tracking-tight">
        {props.step.title}
      </h2>
      <div id={contentId} className="pt-1.5 text-sm text-muted-foreground">
        {props.step.content}
      </div>

      {props.step.showControls && (
        <div className="flex items-center gap-2 pt-4">
          <span className="text-xs tabular-nums text-muted-foreground">
            {props.currentStep + 1} / {props.totalSteps}
          </span>

          <div className="ml-auto inline-flex items-center gap-1.5">
            {props.step.showSkip && props.skipTour && !isLastStep && (
              <Button size="sm" variant="ghost" onClick={props.skipTour}>
                {t("skip")}
              </Button>
            )}
            {props.currentStep > 0 && (
              <Button size="sm" variant="outline" onClick={props.prevStep}>
                {t("back")}
              </Button>
            )}
            <Button ref={primaryRef} size="sm" onClick={props.nextStep}>
              {isLastStep ? t("done") : t("next")}
            </Button>
          </div>
        </div>
      )}

      <span className="text-popover">{props.arrow}</span>
    </div>
  );
}
