import { A } from "@mobily/ts-belt";
import { ArrowUpRightIcon } from "@phosphor-icons/react";
import { useEffect } from "react";
import { useTranslations } from "use-intl";
import { ExternalLink } from "@/components/shared/external-link";
import { useActiveRelease } from "@/hooks/use-active-release";
import {
  CHANGELOG,
  changelogAnchor,
  LATEST_CHANGELOG_VERSION,
} from "@/lib/changelog";
import { REPO_URL } from "@/lib/site";
import { useChangelogStore } from "@/lib/store";
import { PlatformPageScroll } from "../platform/platform-page-scroll";
import { ChangelogRelease } from "./changelog-release";
import { ChangelogVersions } from "./changelog-versions";

const ANCHORS = A.map(CHANGELOG, (entry) => changelogAnchor(entry.version));

/**
 * The release history at `/changelog`: each version and its date beside its
 * highlights. From `xl`, the versions stay in view and mark the one being
 * read. The build also renders this page into the static HTML, so crawlers
 * and agents read it without running the app.
 */
export function ChangelogPage() {
  const t = useTranslations("platform.changelog");
  const active = useActiveRelease(ANCHORS);

  // Opening the page reads the latest release, which clears the sidebar dot.
  useEffect(() => {
    useChangelogStore.getState().markSeen(LATEST_CHANGELOG_VERSION);
  }, []);

  return (
    <PlatformPageScroll>
      <div className="grid gap-12 xl:grid-cols-[minmax(0,1fr)_12rem]">
        <article className="min-w-0">
          <header className="flex flex-col gap-1 border-b pb-6">
            <h1 className="text-3xl font-semibold tracking-tight">
              {t("title")}
            </h1>
            <p className="text-muted-foreground">{t("subtitle")}</p>
          </header>

          <ol className="divide-y">
            {CHANGELOG.map((entry, index) => (
              <li key={entry.version}>
                <ChangelogRelease entry={entry} isLatest={index === 0} />
              </li>
            ))}
          </ol>

          <footer className="border-t pt-6">
            <ExternalLink
              href={`${REPO_URL}/releases`}
              className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {t("fullChangelog")}
              <ArrowUpRightIcon className="size-4" />
            </ExternalLink>
          </footer>
        </article>

        <ChangelogVersions active={active} />
      </div>
    </PlatformPageScroll>
  );
}
