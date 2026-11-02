import { buttonVariants } from "@lanjut/ui/components/button";
import { TooltipProvider } from "@lanjut/ui/components/tooltip";
import { cn } from "@lanjut/ui/lib/utils";
import { ArrowRightIcon } from "@phosphor-icons/react";
import {
  LandingSecondaryActions,
  type SecondaryActionsProps,
} from "./landing-secondary-actions";

interface LandingHeroActionsProps extends SecondaryActionsProps {
  buildHref: string;
  buildLabel: string;
}

/** The hero's actions: one labeled primary action, then two icon buttons. */
export function LandingHeroActions(props: LandingHeroActionsProps) {
  return (
    <TooltipProvider>
      <div className="flex items-center justify-center gap-3">
        <a
          href={props.buildHref}
          className={cn(buttonVariants({ size: "lg" }), "h-11 gap-2 px-5")}
        >
          {props.buildLabel}
          <ArrowRightIcon />
        </a>
        <LandingSecondaryActions {...props} />
      </div>
    </TooltipProvider>
  );
}
