import { ArrowUpRightIcon, GithubLogoIcon } from "@phosphor-icons/react";
import { useTranslations } from "use-intl";
import { ContributorFaces } from "@/components/shared/contributor-faces";
import { ExternalLink } from "@/components/shared/external-link";
import {
  type IslandProps,
  IslandProviders,
} from "@/components/shared/providers";
import { useContributors } from "@/hooks/use-contributors";
import type { Contributor } from "@/lib/contributors";
import { CONTRIBUTING_URL } from "@/lib/site";

/**
 * The people behind the open-source claim of the close, under its actions:
 * their faces, an invitation, and the way to contribute. The list comes from
 * the build, so the static page already names everyone, then refreshes from
 * the Worker's daily copy once the row is in view. Without any list, the
 * invitation stands alone.
 */
export function LandingContributors(
  props: IslandProps & { contributors: ReadonlyArray<Contributor> },
) {
  return (
    <IslandProviders locale={props.locale} pathname={props.pathname}>
      <LandingContributorsRow contributors={props.contributors} />
    </IslandProviders>
  );
}

function LandingContributorsRow(props: {
  contributors: ReadonlyArray<Contributor>;
}) {
  const t = useTranslations();
  const state = useContributors(props.contributors);

  return (
    <div className="flex flex-col gap-5 md:flex-row md:items-center md:gap-8">
      <ContributorFaces state={state} surface="page" />
      <p className="max-w-[52ch] text-muted-foreground">
        {t("landing.contributorsBody")}
      </p>
      <ExternalLink
        href={CONTRIBUTING_URL}
        className="inline-flex shrink-0 items-center gap-1.5 font-medium underline-offset-4 hover:underline md:ml-auto"
      >
        <GithubLogoIcon aria-hidden weight="fill" className="size-4" />
        {t("platform.contributors.contribute")}
        <ArrowUpRightIcon aria-hidden className="size-4" />
      </ExternalLink>
    </div>
  );
}
