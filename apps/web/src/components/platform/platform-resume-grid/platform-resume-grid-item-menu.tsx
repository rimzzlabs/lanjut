import { Button } from "@lanjut/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@lanjut/ui/components/dropdown-menu";
import {
  CopyIcon,
  DotsThreeIcon,
  DownloadSimpleIcon,
  PencilSimpleIcon,
  TrashIcon,
} from "@phosphor-icons/react";
import { Fragment, useState } from "react";
import { useTranslations } from "use-intl";
import { useResumeStore } from "@/lib/store";
import { PlatformResumeActionDelete } from "../platform-resume-action-delete";
import { PlatformResumeActionDownload } from "../platform-resume-action-download";
import { PlatformResumeActionRename } from "../platform-resume-action-rename";

interface PlatformResumeGridItemMenuProps {
  resume: { id: string; title: string };
}

export function PlatformResumeGridItemMenu(
  props: PlatformResumeGridItemMenuProps,
) {
  const { resume } = props;
  const t = useTranslations("platform.grid");
  const duplicateResume = useResumeStore((state) => state.duplicateResume);
  const [open, setOpen] = useState({
    rename: false,
    remove: false,
    download: false,
  });

  const onDuplicate = () => {
    void duplicateResume(resume.id, t("copyOf", { title: resume.title }));
  };

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
          <DotsThreeIcon />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuGroup>
            <DropdownMenuLabel>{t("menu")}</DropdownMenuLabel>
            <DropdownMenuItem onClick={openRenameDialog}>
              <PencilSimpleIcon /> {t("rename")}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onDuplicate}>
              <CopyIcon /> {t("duplicate")}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={openDownloadDialog}>
              <DownloadSimpleIcon />
              {t("download")}
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem variant="destructive" onClick={openRemoveDialog}>
              <TrashIcon /> {t("delete")}
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
