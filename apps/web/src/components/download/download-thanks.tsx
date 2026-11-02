import { Button, buttonVariants } from "@lanjut/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@lanjut/ui/components/dialog";
import { cn } from "@lanjut/ui/lib/utils";
import { A, O, pipe, S } from "@mobily/ts-belt";
import { DownloadSimpleIcon } from "@phosphor-icons/react";
import { useEffect, useRef, useState } from "react";
import { IslandProviders } from "@/components/shared/island-providers";
import type { IslandProps } from "@/components/shared/providers";
import { useReducedMotionPreference } from "@/hooks/use-reduced-motion-preference";
import {
  type ConfettiPiece,
  DownloadConfetti,
  makeConfetti,
} from "./download-confetti";

interface DownloadThanksCopy {
  title: string;
  body: string;
  retry: string;
  steps: string;
}

interface DownloadThanksProps extends IslandProps {
  copy: DownloadThanksCopy;
}

interface Started {
  href: string;
  pieces: ReadonlyArray<ConfettiPiece>;
}

/**
 * Thanks the visitor once an installer link starts its download. The link
 * itself downloads the file, so this only listens: a plain click on any
 * `[data-download]` link opens the dialog. A click that opens a new tab or
 * window does not.
 */
export function DownloadThanks(props: DownloadThanksProps) {
  return (
    <IslandProviders locale={props.locale} pathname={props.pathname}>
      <DownloadThanksDialog copy={props.copy} />
    </IslandProviders>
  );
}

function DownloadThanksDialog(props: { copy: DownloadThanksCopy }) {
  const [started, setStarted] = useState<Started | null>(null);
  const reduceMotion = useReducedMotionPreference();
  const goToSteps = useRef(false);

  useEffect(() => {
    function onClick(event: MouseEvent) {
      const opensElsewhere =
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey;
      if (opensElsewhere || !(event.target instanceof Element)) return;
      const link = event.target.closest<HTMLAnchorElement>("a[data-download]");
      if (!link) return;
      setStarted({
        href: link.href,
        pieces: reduceMotion ? [] : makeConfetti(60),
      });
    }

    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [reduceMotion]);

  const fileName = pipe(
    O.fromNullable(started?.href),
    O.flatMap((href) => A.last(S.split(href, "/"))),
    O.getWithDefault(""),
  );

  return (
    <Dialog
      open={started !== null}
      onOpenChange={(open) => {
        if (!open) setStarted(null);
      }}
      onOpenChangeComplete={(open) => {
        if (open || !goToSteps.current) return;
        goToSteps.current = false;
        const steps = document.getElementById("first-open");
        steps?.scrollIntoView({ behavior: "smooth", block: "start" });
        // The dialog hands focus back to the download link after this runs,
        // so the heading takes it one frame later.
        requestAnimationFrame(() => steps?.focus({ preventScroll: true }));
      }}
    >
      <DialogContent className="isolate overflow-hidden">
        {started && <DownloadConfetti pieces={started.pieces} />}
        <DialogHeader>
          <span className="mb-2 grid size-12 place-items-center rounded-xl bg-primary/10 text-primary">
            <DownloadSimpleIcon weight="duotone" className="size-6" />
          </span>
          <DialogTitle className="text-xl">{props.copy.title}</DialogTitle>
          <DialogDescription>{props.copy.body}</DialogDescription>
        </DialogHeader>
        <p className="truncate rounded-md bg-muted px-3 py-2 font-mono text-xs text-muted-foreground">
          {fileName}
        </p>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              goToSteps.current = true;
              setStarted(null);
            }}
          >
            {props.copy.steps}
          </Button>
          <a
            href={started?.href}
            data-download=""
            className={cn(buttonVariants(), "gap-2")}
          >
            <DownloadSimpleIcon />
            {props.copy.retry}
          </a>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
