import type { Resume, ResumeIndexEntry } from "@lanjut/resume";
import { templateNameOf } from "@lanjut/resume/templates";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@lanjut/ui/components/tooltip";
import { cn } from "@lanjut/ui/lib/utils";
import { useFormatter, useTranslations } from "use-intl";

interface PlatformResumeMetaProps {
  resume: ResumeIndexEntry;
  document: Resume | null;
  className?: string;
}

/** The template name, once the document loads, and when it was last edited. */
export function PlatformResumeMeta(props: PlatformResumeMetaProps) {
  const t = useTranslations("platform.grid");
  const formatter = useFormatter();
  const updatedAt = new Date(props.resume.updatedAt);

  return (
    <p
      className={cn(
        "flex min-w-0 items-center gap-1.5 text-xs text-muted-foreground",
        props.className,
      )}
    >
      {props.document && (
        <>
          <span className="truncate">
            {templateNameOf(props.document.templateId)}
          </span>
          <span aria-hidden>·</span>
        </>
      )}
      <span className="shrink-0">
        {t("edited")}{" "}
        <Tooltip>
          <TooltipTrigger render={<time dateTime={props.resume.updatedAt} />}>
            {formatter.relativeTime(updatedAt, Date.now())}
          </TooltipTrigger>

          <TooltipContent>
            {formatter.dateTime(updatedAt, {
              weekday: "short",
              day: "2-digit",
              month: "short",
              year: "numeric",
            })}
          </TooltipContent>
        </Tooltip>
      </span>
    </p>
  );
}
