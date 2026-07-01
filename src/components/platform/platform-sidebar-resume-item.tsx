import { format } from "date-fns";
import { FileText } from "lucide-react";
import Link from "next/link";
import type { ResumeIndexEntry } from "@/lib/resume";
import { SidebarMenuButton, SidebarMenuItem } from "../ui/sidebar";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

interface PlatformSidebarResumeItemProps {
  resume: ResumeIndexEntry;
}

export function PlatformSidebarResumeItem({
  resume,
}: PlatformSidebarResumeItemProps) {
  return (
    <Tooltip>
      <SidebarMenuItem>
        <TooltipTrigger
          render={
            <SidebarMenuButton
              className="truncate"
              render={<Link href={`/platform/editor/${resume.id}`} />}
            />
          }
        >
          <FileText />
          <span className="truncate">{resume.title}</span>
        </TooltipTrigger>

        <TooltipContent side="inline-end">
          <div className="flex flex-col gap-2">
            <p className="text-sm text-balance">{resume.title}</p>
            <p className="text-xs font-medium text-muted-foreground">
              Last modified:{" "}
              {format(new Date(resume.updatedAt), "EEE dd MMM, yyyy")}
            </p>
          </div>
        </TooltipContent>
      </SidebarMenuItem>
    </Tooltip>
  );
}
