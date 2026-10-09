import { ScrollArea } from "@lanjut/ui/components/scroll-area";
import { cn } from "@lanjut/ui/lib/utils";
import { ClockCounterClockwiseIcon } from "@phosphor-icons/react";
import { useEffect, useId, useRef } from "react";
import { useTranslations } from "use-intl";
import { CHANGELOG, changelogAnchor } from "@/lib/changelog";

/**
 * From `xl`: every version, as links down the page, with the one being read
 * marked. The list scrolls on its own and keeps the marked version in view.
 */
export function ChangelogVersions(props: { active: string }) {
  const t = useTranslations("platform.changelog");
  const headingId = useId();
  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const list = listRef.current;
    const viewport = list?.closest<HTMLElement>(
      '[data-slot="scroll-area-viewport"]',
    );
    const link = list?.querySelector<HTMLElement>('[aria-current="location"]');
    if (!viewport || !link || !props.active) return;

    const view = viewport.getBoundingClientRect();
    const box = link.getBoundingClientRect();
    if (box.top < view.top) viewport.scrollBy({ top: box.top - view.top });
    if (box.bottom > view.bottom) {
      viewport.scrollBy({ top: box.bottom - view.bottom });
    }
  }, [props.active]);

  // The rail sticks 2rem under the top of the page panel and stops 2rem above
  // its bottom. The panel is the window less the 4rem navbar and its 1px top
  // border.
  return (
    <nav
      aria-labelledby={headingId}
      className="sticky top-8 grid max-h-[calc(100svh-8rem-1px)] grid-rows-[auto_minmax(0,1fr)] gap-3 self-start max-xl:hidden"
    >
      <h2
        id={headingId}
        className="flex items-center gap-2 text-sm font-medium"
      >
        <ClockCounterClockwiseIcon className="size-4" />
        {t("versions")}
      </h2>
      <ScrollArea className="min-h-0">
        <ul ref={listRef} className="flex flex-col pr-3">
          {CHANGELOG.map((entry) => (
            <ChangelogVersionLink
              key={entry.version}
              version={entry.version}
              active={changelogAnchor(entry.version) === props.active}
            />
          ))}
        </ul>
      </ScrollArea>
    </nav>
  );
}

function ChangelogVersionLink(props: { version: string; active: boolean }) {
  return (
    <li>
      <a
        href={`#${changelogAnchor(props.version)}`}
        aria-current={props.active ? "location" : undefined}
        className={cn(
          "block border-l py-1 pl-3 font-mono text-sm text-muted-foreground transition-colors hover:text-foreground",
          props.active && "border-foreground text-foreground",
        )}
      >
        v{props.version}
      </a>
    </li>
  );
}
