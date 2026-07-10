"use client";

import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

function GhostLine(props: { className: string }) {
  return (
    <div className={cn("h-1.5 rounded-full bg-neutral-200", props.className)} />
  );
}

function GhostHeading(props: { className: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className={cn("h-2 rounded-full bg-neutral-300", props.className)} />
      <div className="h-px flex-1 bg-neutral-200" />
    </div>
  );
}

function GhostBullet(props: { className: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className="size-1 shrink-0 rounded-full bg-neutral-300" />
      <GhostLine className={props.className} />
    </div>
  );
}

export function PlatformResumeGridItemEmpty() {
  const t = useTranslations("platform.grid");

  return (
    <div className="aspect-210/297 w-full overflow-hidden bg-white">
      <span className="sr-only">{t("emptyDocument")}</span>

      <div
        aria-hidden
        className="flex h-full flex-col justify-between px-[9%] py-[11%]"
      >
        <div className="flex items-start justify-between gap-[8%]">
          <div className="w-1/2 space-y-2.5">
            <div className="flex items-center gap-1">
              <div className="h-2.5 w-[85%] rounded-full bg-neutral-300" />
              <div className="h-4 w-0.5 shrink-0 animate-caret-blink bg-primary motion-reduce:animate-none" />
            </div>
            <GhostLine className="w-[60%]" />
          </div>
          <div className="flex w-[38%] flex-col items-end gap-1.5">
            <GhostLine className="h-1 w-[75%]" />
            <GhostLine className="h-1 w-[90%]" />
            <GhostLine className="h-1 w-[65%]" />
          </div>
        </div>

        <div className="space-y-2.5">
          <GhostHeading className="w-[28%]" />
          <div className="space-y-1.5">
            <GhostLine className="w-full" />
            <GhostLine className="w-[94%]" />
            <GhostLine className="w-[68%]" />
          </div>
        </div>

        <div className="space-y-2.5">
          <GhostHeading className="w-[34%]" />
          <div className="flex items-center justify-between gap-4">
            <GhostLine className="w-[42%]" />
            <GhostLine className="w-[20%]" />
          </div>
          <div className="space-y-1.5">
            <GhostBullet className="w-[92%]" />
            <GhostBullet className="w-[74%]" />
          </div>
        </div>

        <div className="space-y-2.5">
          <GhostHeading className="w-[24%]" />
          <div className="flex flex-wrap gap-1.5">
            <div className="h-3 w-12 rounded bg-neutral-200" />
            <div className="h-3 w-16 rounded bg-neutral-200" />
            <div className="h-3 w-10 rounded bg-neutral-200" />
            <div className="h-3 w-14 rounded bg-neutral-200" />
          </div>
        </div>
      </div>
    </div>
  );
}
