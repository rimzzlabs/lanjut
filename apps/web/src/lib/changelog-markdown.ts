import { MESSAGES } from "@lanjut/i18n/messages";
import { type Locale, localizePath } from "@lanjut/i18n/routing";
import { A, D, O, pipe } from "@mobily/ts-belt";
import {
  CHANGELOG,
  CHANGELOG_DATE_FORMAT,
  type ChangelogEntry,
  type ChangelogHighlight,
  changelogMessageKey,
  changelogReleaseUrl,
} from "./changelog";
import { CHANGELOG_PATHNAME } from "./routes";
import { absoluteUrl } from "./seo";

/** The changelog as Markdown, for agents. `/id` has its own. */
export const CHANGELOG_MARKDOWN_PATHNAME = `${CHANGELOG_PATHNAME}.md`;

function releaseMarkdown(locale: Locale, entry: ChangelogEntry): string {
  const entries: Record<string, ReadonlyArray<ChangelogHighlight>> = MESSAGES[
    locale
  ].platform.changelog.entries;
  const date = new Intl.DateTimeFormat(locale, CHANGELOG_DATE_FORMAT).format(
    new Date(`${entry.date}T00:00:00Z`),
  );
  const highlights = pipe(
    D.get(entries, changelogMessageKey(entry.version)),
    O.getWithDefault<ReadonlyArray<ChangelogHighlight>>([]),
    A.map((highlight) => `### ${highlight.title}\n\n${highlight.description}`),
  );

  return A.join(
    [
      `## v${entry.version} (${date})`,
      `<${changelogReleaseUrl(entry.version)}>`,
      ...highlights,
    ],
    "\n\n",
  );
}

/** Every release, newest first, with the same copy as the changelog page. */
export function changelogMarkdown(locale: Locale): string {
  const copy = MESSAGES[locale].platform.changelog;
  const page = absoluteUrl(localizePath(CHANGELOG_PATHNAME, locale));
  const releases = A.map(CHANGELOG, (entry) => releaseMarkdown(locale, entry));

  return `${A.join([`# ${copy.title}`, `${copy.subtitle}: <${page}>`, ...releases], "\n\n")}\n`;
}
