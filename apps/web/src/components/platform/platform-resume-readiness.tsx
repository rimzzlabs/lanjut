import type { Resume } from "@lanjut/resume";
import { measureReadiness } from "@lanjut/resume/readiness";
import { ProgressRing } from "@lanjut/ui/components/progress-ring";
import { Skeleton } from "@lanjut/ui/components/skeleton";
import { useMemo } from "react";
import { useFormatter, useTranslations } from "use-intl";

function useDocumentReadiness(document: Resume | null) {
  return useMemo(
    () => (document ? measureReadiness(document) : null),
    [document],
  );
}

/**
 * How ready a résumé is to send, as a ring with the percent in it and a
 * caption under it: the same checks as the editor's readiness bar.
 */
export function PlatformResumeReadiness(props: { document: Resume | null }) {
  const t = useTranslations("platform.library");
  const format = useFormatter();
  const readiness = useDocumentReadiness(props.document);

  if (!readiness) return <PlatformResumeReadinessSkeleton />;
  const ready = readiness.percent === 100;

  return (
    <div className="flex flex-col items-center gap-2">
      <ProgressRing
        value={readiness.percent}
        aria-label={t("readiness")}
        className="size-20"
      >
        <span className="text-lg font-semibold tabular-nums">
          {format.number(readiness.percent / 100, { style: "percent" })}
        </span>
      </ProgressRing>
      <span className="text-xs text-muted-foreground">
        {ready ? t("readinessDone") : t("readiness")}
      </span>
    </div>
  );
}

/** The same readiness as one line, a small ring and "60% ready", for a phone. */
export function PlatformResumeReadinessLine(props: {
  document: Resume | null;
}) {
  const t = useTranslations("platform.library");
  const tr = useTranslations("editor.readiness");
  const readiness = useDocumentReadiness(props.document);

  if (!readiness) return <PlatformResumeReadinessLineSkeleton />;
  const ready = readiness.percent === 100;

  return (
    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
      <ProgressRing
        value={readiness.percent}
        aria-label={t("readiness")}
        className="size-4"
      />
      {ready ? tr("ready") : tr("percent", { percent: readiness.percent })}
    </div>
  );
}

/** The ring and caption while the document loads, at the size they render. */
export function PlatformResumeReadinessSkeleton() {
  return (
    <div className="flex flex-col items-center gap-2">
      <Skeleton className="size-20 rounded-full" />
      <Skeleton className="h-4 w-16" />
    </div>
  );
}

export function PlatformResumeReadinessLineSkeleton() {
  return (
    <div className="flex items-center gap-1.5">
      <Skeleton className="size-4 rounded-full" />
      <Skeleton className="h-3 w-16" />
    </div>
  );
}
