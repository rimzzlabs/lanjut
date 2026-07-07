import { useFormatter, useTranslations } from "next-intl";
import {
  Card,
  CardAction,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Link } from "@/i18n/navigation";
import type { ResumeIndexEntry } from "@/lib/resume";
import { PlatformResumeGridItemMenu } from "./platform-resume-grid-item-menu";
import { PlatformResumeGridItemThumbnail } from "./platform-resume-grid-item-thumbnail";

interface PlatformResumeGridItemProps {
  resume: ResumeIndexEntry;
}

export function PlatformResumeGridItem({
  resume,
}: PlatformResumeGridItemProps) {
  const t = useTranslations("platform.grid");
  const formatter = useFormatter();
  const updatedAt = new Date(resume.updatedAt);
  const href = `/platform/editor/${resume.id}`;

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
        <CardTitle className="truncate">
          <Link
            href={href}
            className="rounded-xs hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            {resume.title}
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
