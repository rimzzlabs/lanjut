import { Button } from "@lanjut/ui/components/button";
import { TooltipProvider } from "@lanjut/ui/components/tooltip";
import { ArrowRightIcon } from "@phosphor-icons/react";
import { useTranslations } from "use-intl";
import { IslandProviders } from "@/components/shared/island-providers";
import type { IslandProps } from "@/components/shared/providers";
import { useLandingDraftCreate } from "@/hooks/use-landing-draft-create";
import {
  LandingSecondaryActions,
  type SecondaryActionsProps,
} from "./landing-secondary-actions";

/**
 * The closing actions, the same as the hero's. The primary one carries any
 * draft typed in the read-back demo into the editor.
 */
export function LandingClosureActions(
  props: IslandProps & SecondaryActionsProps,
) {
  return (
    <IslandProviders locale={props.locale} pathname={props.pathname}>
      <TooltipProvider>
        <LandingClosureButtons {...props} />
      </TooltipProvider>
    </IslandProviders>
  );
}

function LandingClosureButtons(props: SecondaryActionsProps) {
  const t = useTranslations("landing");
  const { create, creating } = useLandingDraftCreate();

  return (
    <div className="flex items-center justify-center gap-3">
      <Button
        size="lg"
        className="h-11 gap-2 px-5"
        disabled={creating}
        onClick={() => void create()}
      >
        {t("closeCta")}
        <ArrowRightIcon />
      </Button>
      <LandingSecondaryActions {...props} />
    </div>
  );
}
