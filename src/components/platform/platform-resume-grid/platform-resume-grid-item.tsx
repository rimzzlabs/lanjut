import { format, formatDistanceStrict } from "date-fns";
import { Eye } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
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

interface PlatformResumeGridItemProps {
  resume: ResumeIndexEntry;
}

export function PlatformResumeGridItem({
  resume,
}: PlatformResumeGridItemProps) {
  const updatedAt = new Date(resume.updatedAt);

  return (
    <Card size="sm">
      <CardHeader>
        <CardTitle className="truncate">{resume.title}</CardTitle>
        <CardDescription className="text-xs">
          Last modified:{" "}
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

      <CardFooter className="justify-end gap-2 mt-auto">
        <Button
          size="sm"
          nativeButton={false}
          render={<Link href={`/platform/editor/${resume.id}`} />}
        >
          <Eye />
          View
        </Button>
      </CardFooter>
    </Card>
  );
}
