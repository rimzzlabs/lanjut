import { FileText, MoreVertical, Pen, Trash } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
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
import { PlatformResumeActionDelete } from "./platform-resume-action-delete";
import { PlatformResumeActionRename } from "./platform-resume-action-rename";

interface PlatformSidebarResumeItemProps {
  resume: ResumeIndexEntry;
}

export function PlatformSidebarResumeItem({
  resume,
}: PlatformSidebarResumeItemProps) {
  const { id } = useParams<{ id?: string }>();
  const [open, setOpen] = useState({ rename: false, remove: false });

  const openRenameDialog = () => setOpen((prev) => ({ ...prev, rename: true }));
  const onOpenRename = (next: boolean) => {
    setOpen((prev) => ({ ...prev, rename: next }));
  };

  const openRemoveDialog = () => setOpen((prev) => ({ ...prev, remove: true }));
  const onOpenRemove = (next: boolean) => {
    setOpen((prev) => ({ ...prev, remove: next }));
  };

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
              <DropdownMenuItem onClick={openRenameDialog}>
                <Pen />
                Rename
              </DropdownMenuItem>

              {id !== resume.id && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    variant="destructive"
                    onClick={openRemoveDialog}
                  >
                    <Trash />
                    Delete
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuButton>

      <PlatformResumeActionRename
        key={resume.title}
        resume={resume}
        open={open.rename}
        onOpenChange={onOpenRename}
      />

      <PlatformResumeActionDelete
        resume={resume}
        open={open.remove}
        onOpenChange={onOpenRemove}
      />
    </SidebarMenuItem>
  );
}
