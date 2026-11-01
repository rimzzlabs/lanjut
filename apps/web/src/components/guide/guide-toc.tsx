import { cn } from "@lanjut/ui/lib/utils";
import { A, O, pipe } from "@mobily/ts-belt";
import { TextAlignLeftIcon } from "@phosphor-icons/react";
import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { useActiveHeading } from "@/hooks/use-active-heading";
import type { TocHeading } from "./guide-toc-headings";

interface GuideTocProps {
  label: string;
  headings: ReadonlyArray<TocHeading>;
}

interface MarkerPosition {
  top: number;
  height: number;
}

/** The second-level heading that holds the active one, or the active one. */
function sectionSlugOf(
  headings: ReadonlyArray<TocHeading>,
  activeSlug: string,
): string {
  return pipe(
    A.getIndexBy(headings, (heading) => heading.slug === activeSlug),
    O.flatMap((index) =>
      pipe(
        A.take(headings, index + 1),
        A.reverse,
        A.find((heading) => heading.depth === 2),
      ),
    ),
    O.mapWithDefault(activeSlug, (heading) => heading.slug),
  );
}

function linkOf(list: HTMLUListElement | null, slug: string) {
  return list?.querySelector<HTMLAnchorElement>(
    `a[data-slug="${CSS.escape(slug)}"]`,
  );
}

/**
 * The table of contents beside a guide. A bar marks the section the reader is
 * in, from its heading down to the subheading in view.
 */
export function GuideToc(props: GuideTocProps) {
  const listRef = useRef<HTMLUListElement>(null);
  const [marker, setMarker] = useState<MarkerPosition | null>(null);
  const slugs = useMemo(
    () => A.map(props.headings, (heading) => heading.slug),
    [props.headings],
  );
  const active = useActiveHeading(slugs);
  const section = sectionSlugOf(props.headings, active);

  // The marker follows the rendered links, so it is measured after layout.
  useLayoutEffect(() => {
    const sectionLink = linkOf(listRef.current, section);
    const activeLink = linkOf(listRef.current, active);
    if (!sectionLink || !activeLink) return;
    setMarker({
      top: sectionLink.offsetTop,
      height:
        activeLink.offsetTop + activeLink.offsetHeight - sectionLink.offsetTop,
    });
  }, [active, section]);

  return (
    <nav aria-labelledby="guide-toc-title" className="text-sm">
      <p
        id="guide-toc-title"
        className="flex items-center gap-2 pb-3 font-medium text-foreground"
      >
        <TextAlignLeftIcon aria-hidden className="size-4" />
        {props.label}
      </p>
      <div className="relative">
        <div aria-hidden className="absolute inset-y-0 left-0 w-px bg-border" />
        {marker && (
          <div
            aria-hidden
            className="absolute left-0 w-0.5 -translate-x-px rounded-full bg-foreground transition-[top,height] duration-200 ease-out"
            style={{ top: marker.top, height: marker.height }}
          />
        )}
        <ul ref={listRef} className="relative flex flex-col">
          {props.headings.map((heading) => (
            <GuideTocItem
              key={heading.slug}
              heading={heading}
              highlighted={heading.slug === active || heading.slug === section}
              current={heading.slug === active}
            />
          ))}
        </ul>
      </div>
    </nav>
  );
}

interface GuideTocItemProps {
  heading: TocHeading;
  highlighted: boolean;
  current: boolean;
}

function GuideTocItem(props: GuideTocItemProps) {
  return (
    <li>
      <a
        href={`#${props.heading.slug}`}
        data-slug={props.heading.slug}
        data-highlighted={props.highlighted}
        aria-current={props.current ? "location" : undefined}
        className={cn(
          "block py-1 pr-2 leading-snug text-pretty text-muted-foreground transition-colors hover:text-foreground data-[highlighted=true]:text-foreground",
          props.heading.depth === 2 && "pl-4",
          props.heading.depth === 3 && "pl-7",
        )}
      >
        {props.heading.text}
      </a>
    </li>
  );
}
