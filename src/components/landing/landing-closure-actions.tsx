import { ArrowRightIcon, MagnifyingGlassIcon } from "@phosphor-icons/react";
import { useTranslations } from "use-intl";
import {
  type IslandProps,
  IslandProviders,
} from "@/components/shared/providers";
import { Button, buttonVariants } from "@/components/ui/button";
import { useLandingDraftCreate } from "@/hooks/use-landing-draft-create";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

/** The closing actions, carrying any draft typed in the hero into the editor. */
export function LandingClosureActions(props: IslandProps) {
  return (
    <IslandProviders locale={props.locale} pathname={props.pathname}>
      <LandingClosureButtons />
    </IslandProviders>
  );
}

function LandingClosureButtons() {
  const t = useTranslations("landing");
  const { create, creating } = useLandingDraftCreate();

  return (
    <div className="flex w-full max-w-xs flex-col gap-3 sm:w-auto sm:max-w-none sm:flex-row sm:gap-4">
      <Button
        size="lg"
        className="h-11 gap-2 px-5"
        disabled={creating}
        onClick={() => void create()}
      >
        {t("closeCta")}
        <ArrowRightIcon />
      </Button>
      <Link
        href="/platform/template"
        className={cn(
          buttonVariants({ size: "lg", variant: "outline" }),
          "h-11 px-5",
        )}
      >
        <MagnifyingGlassIcon />
        {t("closeBrowse")}
      </Link>
    </div>
  );
}
