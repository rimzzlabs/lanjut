"use client";

import { format } from "date-fns";
import { ArrowUpRight, Sparkles } from "lucide-react";
import { useState } from "react";
import { useIsClient } from "@/hooks/use-is-client";
import {
  CHANGELOG,
  type ChangelogEntry,
  LATEST_CHANGELOG_VERSION,
} from "@/lib/changelog";
import { useChangelogStore } from "@/lib/store";
import { Button } from "../ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../ui/sheet";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

export function PlatformNavbarChangelog() {
  const mounted = useIsClient();
  const [open, setOpen] = useState(false);
  const lastSeenVersion = useChangelogStore((state) => state.lastSeenVersion);

  const hasUnseen = lastSeenVersion !== LATEST_CHANGELOG_VERSION;

  const onOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (nextOpen) {
      useChangelogStore.getState().markSeen(LATEST_CHANGELOG_VERSION);
    }
  };

  if (!mounted) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <Tooltip>
        <TooltipTrigger
          render={
            <SheetTrigger
              render={
                <Button size="icon" variant="outline" className="relative" />
              }
            />
          }
        >
          <Sparkles />
          <span className="sr-only">What&apos;s new</span>
          {hasUnseen && (
            <span
              aria-hidden
              className="absolute -top-0.5 -right-0.5 size-2 rounded-full bg-primary animate-pulse motion-reduce:animate-none"
            />
          )}
        </TooltipTrigger>
        <TooltipContent>What&apos;s new</TooltipContent>
      </Tooltip>

      <SheetContent side="right">
        <SheetHeader>
          <SheetTitle>What&apos;s new</SheetTitle>
          <SheetDescription>
            The latest improvements to Lanjut, in plain language.
          </SheetDescription>
        </SheetHeader>

        <ul className="flex-1 space-y-8 overflow-y-auto px-6 pb-6">
          {CHANGELOG.map((entry, index) => (
            <PlatformNavbarChangelogEntry
              key={entry.version}
              entry={entry}
              isLatest={index === 0}
            />
          ))}
        </ul>

        <SheetFooter className="border-t">
          <a
            href="https://github.com/rimzzlabs/lanjut/releases"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Full changelog on GitHub
            <ArrowUpRight className="size-4" />
          </a>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

function PlatformNavbarChangelogEntry(props: {
  entry: ChangelogEntry;
  isLatest: boolean;
}) {
  return (
    <li>
      <div className="flex items-center gap-2">
        <span className="rounded-md border bg-muted px-1.5 py-0.5 font-mono text-xs">
          v{props.entry.version}
        </span>
        {props.isLatest && (
          <span className="rounded-md bg-primary/10 px-1.5 py-0.5 text-xs font-medium text-primary">
            Latest
          </span>
        )}
        <span className="text-xs text-muted-foreground">
          {format(new Date(props.entry.date), "MMM d, yyyy")}
        </span>
      </div>
      <ul className="mt-3 list-disc space-y-2 pl-4 text-sm text-foreground/80">
        {props.entry.highlights.map((highlight) => (
          <li key={highlight}>{highlight}</li>
        ))}
      </ul>
    </li>
  );
}
