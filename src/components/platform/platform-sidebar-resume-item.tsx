import { FileText, MoreVertical, Pen, Trash } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import type { ResumeIndexEntry } from "@/lib/resume";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { SidebarMenuButton, SidebarMenuItem } from "../ui/sidebar";

interface PlatformSidebarResumeItemProps {
  resume: ResumeIndexEntry;
}

export function PlatformSidebarResumeItem({
  resume,
}: PlatformSidebarResumeItemProps) {
  const { id } = useParams<{ id?: string }>();

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        isActive={id === resume.id}
        className="truncate"
        render={<Link href={`/platform/editor/${resume.id}`} />}
      >
        <FileText />
        <span className="truncate">{resume.title}</span>

        <DropdownMenu>
          <DropdownMenuTrigger
            onClick={(e) => e.preventDefault()}
            render={
              <Button size="icon-xs" className="ml-auto" variant="ghost" />
            }
          >
            <span className="sr-only">Menu</span>
            <MoreVertical />
          </DropdownMenuTrigger>

          <DropdownMenuContent align="start">
            <DropdownMenuGroup>
              <DropdownMenuLabel>Modify {resume.title}</DropdownMenuLabel>
              <DropdownMenuItem>
                <Pen />
                Rename
              </DropdownMenuItem>

              {id !== resume.id && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem variant="destructive">
                    <Trash />
                    Delete
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}
