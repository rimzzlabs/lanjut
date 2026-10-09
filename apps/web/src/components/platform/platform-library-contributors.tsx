import { buttonVariants } from "@lanjut/ui/components/button";
import { cn } from "@lanjut/ui/lib/utils";
import { GithubLogoIcon } from "@phosphor-icons/react";
import { useId } from "react";
import { useTranslations } from "use-intl";
import { useContributors } from "@/hooks/use-contributors";
import { CONTRIBUTING_URL } from "@/lib/site";
import { ContributorFaces } from "../shared/contributor-faces";
import { ExternalLink } from "../shared/external-link";
import { PlatformSectionHeading } from "./platform-section-heading";

/**
 * A thank-you to the people who build Lanjut, and an invitation to join
 * them. The faces come from the Worker's daily copy of the GitHub contributor
 * list; without it, the invitation stands alone.
 */
export function PlatformLibraryContributors() {
  const t = useTranslations("platform.contributors");
  const headingId = useId();
  const state = useContributors();

  return (
    <section aria-labelledby={headingId} className="flex flex-col gap-3">
      <PlatformSectionHeading id={headingId}>
        {t("title")}
      </PlatformSectionHeading>
      <div className="flex flex-col gap-5 rounded-xl bg-card p-4 ring-1 ring-foreground/10 sm:p-5 md:flex-row md:items-center md:justify-between">
        <div className="flex min-w-0 flex-col gap-4">
          <p className="max-w-prose text-sm text-muted-foreground">
            {t("description")}
          </p>
          <ContributorFaces state={state} surface="card" />
        </div>
        <ExternalLink
          href={CONTRIBUTING_URL}
          className={cn(buttonVariants({ variant: "outline" }), "shrink-0")}
        >
          <GithubLogoIcon weight="fill" data-icon="inline-start" />
          {t("contribute")}
        </ExternalLink>
      </div>
    </section>
  );
}
