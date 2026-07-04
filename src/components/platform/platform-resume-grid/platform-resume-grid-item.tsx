import { format, formatDistanceStrict } from "date-fns";
import Link from "next/link";
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
import type { ResumeIndexEntry } from "@/lib/resume";
import { PlatformResumeGridItemMenu } from "./platform-resume-grid-item-menu";
import { PlatformResumeGridItemThumbnail } from "./platform-resume-grid-item-thumbnail";

interface PlatformResumeGridItemProps {
  resume: ResumeIndexEntry;
}

export function PlatformResumeGridItem({
  resume,
}: PlatformResumeGridItemProps) {
  const updatedAt = new Date(resume.updatedAt);
  const href = `/platform/editor/${resume.id}`;

  return (
    <Card size="sm" className="pt-0">
      <div className="relative">
        <PlatformResumeGridItemThumbnail resume={resume} />
        <Link
          href={href}
          aria-label={`Open ${resume.title}`}
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
          Edited{" "}
          <Tooltip>
            <TooltipTrigger render={<time dateTime={resume.updatedAt} />}>
              {formatDistanceStrict(updatedAt, Date.now(), { addSuffix: true })}
            </TooltipTrigger>

            <TooltipContent>
              {format(updatedAt, "EEE, dd MMM yyyy")}
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
