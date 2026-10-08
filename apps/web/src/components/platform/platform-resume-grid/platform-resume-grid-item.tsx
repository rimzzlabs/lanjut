import type { ResumeIndexEntry } from "@lanjut/resume";
import {
  Card,
  CardAction,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@lanjut/ui/components/card";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@lanjut/ui/components/tooltip";
import { useFormatter, useTranslations } from "use-intl";
import { Link } from "@/i18n/navigation";
import { editorHref } from "@/lib/routes";
import { TruncatedLabel } from "../../shared/truncated-label";
import { PlatformResumeGridItemMenu } from "./platform-resume-grid-item-menu";
import { PlatformResumeGridItemThumbnail } from "./platform-resume-grid-item-thumbnail";

interface PlatformResumeGridItemProps {
  resume: ResumeIndexEntry;
}

export function PlatformResumeGridItem(props: PlatformResumeGridItemProps) {
  const { resume } = props;
  const t = useTranslations("platform.grid");
  const formatter = useFormatter();
  const updatedAt = new Date(resume.updatedAt);
  const href = editorHref(resume.id);

  return (
    <Card size="sm" className="pt-0">
      <div className="relative">
        <PlatformResumeGridItemThumbnail resume={resume} />
        <Link
          href={href}
          aria-label={t("open", { title: resume.title })}
          className="absolute inset-0 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring"
        />
      </div>

      <CardHeader>
        <CardTitle className="min-w-0">
          <Link
            href={href}
            className="block rounded-xs hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            <TruncatedLabel text={resume.title} />
          </Link>
        </CardTitle>
        <CardDescription className="text-xs">
          {t("edited")}{" "}
          <Tooltip>
            <TooltipTrigger render={<time dateTime={resume.updatedAt} />}>
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
        </CardDescription>
        <CardAction>
          <PlatformResumeGridItemMenu resume={resume} />
        </CardAction>
      </CardHeader>
    </Card>
  );
}
