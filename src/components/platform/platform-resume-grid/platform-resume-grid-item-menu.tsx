"use client";

import { Download, MoreHorizontal, Pen, Trash } from "lucide-react";
import { useTranslations } from "next-intl";
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
import { PlatformResumeActionDownload } from "../platform-resume-action-download";
import { PlatformResumeActionRename } from "../platform-resume-action-rename";

interface PlatformResumeGridItemMenuProps {
  resume: { id: string; title: string };
}

export function PlatformResumeGridItemMenu({
  resume,
}: PlatformResumeGridItemMenuProps) {
  const t = useTranslations("platform.grid");
  const [open, setOpen] = useState({
    rename: false,
    remove: false,
    download: false,
  });

  const openRemoveDialog = () => setOpen((prev) => ({ ...prev, remove: true }));
  const onOpenRemove = (next: boolean) => {
    setOpen((prev) => ({ ...prev, remove: next }));
  };

  const openRenameDialog = () => setOpen((prev) => ({ ...prev, rename: true }));
  const onOpenRename = (next: boolean) => {
    setOpen((prev) => ({ ...prev, rename: next }));
  };

  const openDownloadDialog = () =>
    setOpen((prev) => ({ ...prev, download: true }));
  const onOpenDownload = (next: boolean) => {
    setOpen((prev) => ({ ...prev, download: next }));
  };

  return (
    <Fragment>
      <DropdownMenu>
        <DropdownMenuTrigger render={<Button size="icon-sm" variant="ghost" />}>
          <span className="sr-only">{t("menu")}</span>
          <MoreHorizontal />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuGroup>
            <DropdownMenuLabel>{t("menu")}</DropdownMenuLabel>
            <DropdownMenuItem onClick={openRenameDialog}>
              <Pen /> {t("rename")}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={openDownloadDialog}>
              <Download />
              {t("download")}
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem variant="destructive" onClick={openRemoveDialog}>
              <Trash /> {t("delete")}
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

      <PlatformResumeActionDownload
        resume={resume}
        open={open.download}
        onOpenChange={onOpenDownload}
      />
    </Fragment>
  );
}
