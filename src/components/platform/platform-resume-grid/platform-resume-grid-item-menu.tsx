"use client";

import { Download, MoreHorizontal, Pen, Trash } from "lucide-react";
import { Fragment, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PlatformResumeActionDelete } from "../platform-resume-action-delete";
import { PlatformResumeActionRename } from "../platform-resume-action-rename";

interface PlatformResumeGridItemMenuProps {
  resume: { id: string; title: string };
}

export function PlatformResumeGridItemMenu({
  resume,
}: PlatformResumeGridItemMenuProps) {
  const [open, setOpen] = useState({ rename: false, remove: false });

  const openRemoveDialog = () => setOpen((prev) => ({ ...prev, remove: true }));
  const onOpenRemove = (next: boolean) => {
    setOpen((prev) => ({ ...prev, remove: next }));
  };

  const openRenameDialog = () => setOpen((prev) => ({ ...prev, rename: true }));
  const onOpenRename = (next: boolean) => {
    setOpen((prev) => ({ ...prev, rename: next }));
  };

  return (
    <Fragment>
      <DropdownMenu>
        <DropdownMenuTrigger render={<Button size="icon-sm" variant="ghost" />}>
          <span className="sr-only">Menu</span>
          <MoreHorizontal />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuGroup>
            <DropdownMenuLabel>Menu</DropdownMenuLabel>
            <DropdownMenuItem onClick={openRenameDialog}>
              <Pen /> Rename
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Download />
              Download
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem variant="destructive" onClick={openRemoveDialog}>
              <Trash /> Delete
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>

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
    </Fragment>
  );
}
