import { A, O, pipe, S } from "@mobily/ts-belt";
import {
  ArrowUpRightIcon,
  CaretDownIcon,
  SparkleIcon,
} from "@phosphor-icons/react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useId, useState } from "react";
import { useFormatter, useTranslations } from "use-intl";
import { useIsClient } from "@/hooks/use-is-client";
import {
  CHANGELOG,
  type ChangelogEntry,
  LATEST_CHANGELOG_VERSION,
} from "@/lib/changelog";
import { useChangelogStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { ExternalLink } from "../shared/external-link";
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

const listVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06, delayChildren: 0.04 } },
};

const INSTANT = { duration: 0 };
const ITEM_HIDDEN = { opacity: 0, y: 16 };
const ITEM_HIDDEN_REDUCED = { opacity: 0 };
const CHEVRON_TRANSITION = { duration: 0.2 };
const PANEL_TRANSITION = {
  duration: 0.25,
  ease: [0.4, 0, 0.2, 1] as [number, number, number, number],
};

export function PlatformNavbarChangelog() {
  const mounted = useIsClient();
  const t = useTranslations("platform.changelog");
  const [open, setOpen] = useState(false);
  const lastSeenVersion = useChangelogStore((state) => state.lastSeenVersion);
  const [openVersions, setOpenVersions] = useState<ReadonlyArray<string>>(() =>
    pipe(
      CHANGELOG,
      A.head,
      O.map((entry) => entry.version),
      O.filter(S.isNotEmpty),
      O.match(
        (version) => [version],
        () => [],
      ),
    ),
  );

  const hasUnseen = lastSeenVersion !== LATEST_CHANGELOG_VERSION;

  const onOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (nextOpen) {
      useChangelogStore.getState().markSeen(LATEST_CHANGELOG_VERSION);
    }
  };

  const toggle = (version: string) =>
    setOpenVersions((prev) => {
      if (A.includes(prev, version)) {
        return A.filter(prev, (v) => v !== version);
      }
      return A.append(prev, version);
    });

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
          <SparkleIcon />
          <span className="sr-only">{t("whatsNew")}</span>
          {hasUnseen && (
            <span
              aria-hidden
              className="absolute -top-0.5 -right-0.5 size-2 rounded-full bg-primary animate-pulse motion-reduce:animate-none"
            />
          )}
        </TooltipTrigger>
        <TooltipContent>{t("whatsNew")}</TooltipContent>
      </Tooltip>

      <SheetContent side="right">
        <SheetHeader>
          <SheetTitle>{t("whatsNew")}</SheetTitle>
          <SheetDescription>{t("description")}</SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 py-2">
          <div className="relative before:absolute before:top-6 before:bottom-6 before:left-[7px] before:w-px before:bg-border">
            {CHANGELOG.map((entry, index) => (
              <PlatformNavbarChangelogEntry
                key={entry.version}
                entry={entry}
                isLatest={index === 0}
                isOpen={A.includes(openVersions, entry.version)}
                onToggle={() => toggle(entry.version)}
              />
            ))}
          </div>
        </div>

        <SheetFooter className="border-t">
          <ExternalLink
            href="https://github.com/rimzzlabs/lanjut/releases"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            {t("fullChangelog")}
            <ArrowUpRightIcon className="size-4" />
          </ExternalLink>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

function PlatformNavbarChangelogEntry(props: {
  entry: ChangelogEntry;
  isLatest: boolean;
  isOpen: boolean;
  onToggle: () => void;
}) {
  const t = useTranslations("platform.changelog");
  const formatter = useFormatter();
  const reduceMotion = useReducedMotion();
  const panelId = useId();
  const highlights = t.raw(
    `entries.${S.replaceByRe(props.entry.version, /\./g, "_")}`,
  ) as Array<{ title: string; description: string }>;

  const itemVariants = {
    hidden: reduceMotion ? ITEM_HIDDEN_REDUCED : ITEM_HIDDEN,
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.35, ease: "easeOut" as const },
    },
  };

  return (
    <div className="relative pl-7">
      <span
        aria-hidden
        className="pointer-events-none absolute top-5.5 left-1.75 h-px w-5 bg-border"
      />
      {props.isLatest && (
        <span
          aria-hidden
          className="pointer-events-none absolute top-5.5 left-1.75 size-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/40 motion-safe:animate-ping"
        />
      )}
      <span
        aria-hidden
        className={cn(
          "pointer-events-none absolute top-5.5 left-1.75 z-10 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 ring-4 ring-popover",
          props.isLatest && "border-primary bg-primary",
          !props.isLatest && "border-border bg-popover",
        )}
      />

      <button
        type="button"
        aria-expanded={props.isOpen}
        aria-controls={panelId}
        onClick={props.onToggle}
        className="flex w-full items-center gap-2 py-2.5 text-left outline-none focus-visible:underline"
      >
        <span className="rounded-md border bg-muted px-1.5 py-0.5 font-mono text-xs">
          v{props.entry.version}
        </span>
        {props.isLatest && (
          <span className="rounded-md bg-primary/10 px-1.5 py-0.5 text-xs font-medium text-primary">
            {t("latest")}
          </span>
        )}
        <span className="font-mono text-xs text-muted-foreground">
          {formatter.dateTime(new Date(props.entry.date), {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </span>
        <motion.span
          aria-hidden
          className="ml-auto flex shrink-0 text-muted-foreground"
          animate={{ rotate: props.isOpen ? 180 : 0 }}
          transition={reduceMotion ? INSTANT : CHEVRON_TRANSITION}
        >
          <CaretDownIcon className="size-4" />
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {props.isOpen && (
          <motion.div
            id={panelId}
            key="panel"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={reduceMotion ? INSTANT : PANEL_TRANSITION}
            className="overflow-hidden"
          >
            <motion.ul
              variants={listVariants}
              initial="hidden"
              animate="visible"
              className="space-y-3.5 pb-4 text-sm"
            >
              {highlights.map((highlight) => (
                <motion.li
                  key={highlight.title}
                  variants={itemVariants}
                  className="space-y-0.5"
                >
                  <p className="font-medium text-foreground">
                    {highlight.title}
                  </p>
                  <p className="text-foreground/70">{highlight.description}</p>
                </motion.li>
              ))}
            </motion.ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
