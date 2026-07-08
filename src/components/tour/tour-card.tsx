"use client";

import { useTranslations } from "next-intl";
import type { CardComponentProps } from "nextstepjs";
import { Button } from "../ui/button";

export function TourCard(props: CardComponentProps) {
  const t = useTranslations("tour.controls");
  const isLastStep = props.currentStep === props.totalSteps - 1;

  return (
    <div className="w-80 rounded-2xl border bg-popover p-4 text-popover-foreground shadow-lg">
      <h2 className="text-sm font-semibold tracking-tight">
        {props.step.title}
      </h2>
      <div className="pt-1.5 text-sm text-muted-foreground">
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
            <Button size="sm" onClick={props.nextStep}>
              {isLastStep ? t("done") : t("next")}
            </Button>
          </div>
        </div>
      )}

      <span className="text-popover">{props.arrow}</span>
    </div>
  );
}
