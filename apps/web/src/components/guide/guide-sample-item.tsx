import { ArrowRightIcon, MagnifyingGlassPlusIcon } from "@phosphor-icons/react";
import type { ResumePreview } from "@/components/editor/resume-preview";
import { ResumeThumbnail } from "@/components/editor/resume-thumbnail";
import type { GuideSampleTemplate } from "./guide-sample-types";

interface GuideSampleItemProps {
  template: GuideSampleTemplate;
  preview: ResumePreview;
  openLabel: string;
  onOpen: () => void;
}

/**
 * One template's first page. The thumbnail holds the résumé's own links, so
 * it cannot sit inside a button: a button laid over the whole card opens the
 * full-size preview instead.
 */
export function GuideSampleItem(props: GuideSampleItemProps) {
  return (
    <li className="group relative flex flex-col gap-2">
      <span className="relative block overflow-hidden rounded-lg bg-white ring-1 ring-foreground/10 transition-shadow group-hover:shadow-lg group-hover:shadow-foreground/10">
        <ResumeThumbnail resume={props.preview} template={props.template.id} />
        <span className="absolute right-2 bottom-2 grid size-8 place-items-center rounded-full bg-background/90 text-foreground opacity-0 shadow-sm ring-1 ring-foreground/10 transition-opacity group-hover:opacity-100 group-has-focus-visible:opacity-100">
          <MagnifyingGlassPlusIcon aria-hidden="true" className="size-4" />
        </span>
      </span>
      <span className="text-sm font-medium">{props.template.name}</span>
      <button
        type="button"
        onClick={props.onOpen}
        className="absolute inset-0 cursor-zoom-in rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-background"
      >
        <span className="sr-only">
          {props.template.name}. {props.openLabel}
        </span>
      </button>
    </li>
  );
}

/** The last tile: a link to every template. */
export function GuideSampleMore(props: { href: string; label: string }) {
  return (
    <li>
      <a
        href={props.href}
        className="flex aspect-[1/1.414] w-full flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border p-4 text-center text-sm font-medium transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      >
        <span className="grid size-10 place-items-center rounded-full bg-primary/10 text-primary">
          <ArrowRightIcon aria-hidden="true" className="size-5" />
        </span>
        {props.label}
      </a>
    </li>
  );
}
