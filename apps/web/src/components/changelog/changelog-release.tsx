import { Badge } from "@lanjut/ui/components/badge";
import { Button } from "@lanjut/ui/components/button";
import { ArrowUpRightIcon } from "@phosphor-icons/react";
import { useId } from "react";
import { useFormatter, useTranslations } from "use-intl";
import { ExternalLink } from "@/components/shared/external-link";
import {
  CHANGELOG_DATE_FORMAT,
  type ChangelogEntry,
  type ChangelogHighlight,
  changelogAnchor,
  changelogMessageKey,
  changelogReleaseUrl,
} from "@/lib/changelog";

/**
 * One release: its version, which links to the GitHub release, its date, and
 * its highlights. From `lg` the version and date stay in view while the
 * highlights of their release scroll past.
 */
export function ChangelogRelease(props: {
  entry: ChangelogEntry;
  isLatest: boolean;
}) {
  const t = useTranslations("platform.changelog");
  const formatter = useFormatter();
  const headingId = useId();
  const highlights = t.raw(
    `entries.${changelogMessageKey(props.entry.version)}`,
  ) as ReadonlyArray<ChangelogHighlight>;

  return (
    <section
      id={changelogAnchor(props.entry.version)}
      aria-labelledby={headingId}
      className="grid scroll-mt-6 gap-4 py-10 md:grid-cols-[9rem_minmax(0,1fr)] md:gap-10"
    >
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 md:flex-col md:items-start lg:sticky lg:top-8 lg:self-start">
        <h2 id={headingId}>
          <Button
            variant="outline"
            size="sm"
            nativeButton={false}
            className="font-mono"
            render={
              <ExternalLink href={changelogReleaseUrl(props.entry.version)} />
            }
          >
            v{props.entry.version}
            <ArrowUpRightIcon data-icon="inline-end" />
          </Button>
        </h2>
        <time
          dateTime={props.entry.date}
          className="text-sm text-muted-foreground"
        >
          {formatter.dateTime(
            new Date(`${props.entry.date}T00:00:00Z`),
            CHANGELOG_DATE_FORMAT,
          )}
        </time>
        {props.isLatest && (
          <Badge className="bg-primary/10 text-primary">{t("latest")}</Badge>
        )}
      </div>

      <ul className="flex flex-col gap-6">
        {highlights.map((highlight) => (
          <ChangelogHighlightItem key={highlight.title} highlight={highlight} />
        ))}
      </ul>
    </section>
  );
}

function ChangelogHighlightItem(props: { highlight: ChangelogHighlight }) {
  return (
    <li className="flex flex-col gap-1.5">
      <h3 className="font-medium">{props.highlight.title}</h3>
      <p className="max-w-prose leading-relaxed text-muted-foreground">
        {props.highlight.description}
      </p>
    </li>
  );
}
