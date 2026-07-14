import type { BaseUIEvent } from "@base-ui/react";
import { Copy, FileText, MoreVertical, Pen, Trash } from "lucide-react";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { type MouseEvent, useState } from "react";
import { Link } from "@/i18n/navigation";
import type { ResumeIndexEntry } from "@/lib/resume";
import { useResumeStore } from "@/lib/store";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import {
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
} from "../ui/sidebar";
import { PlatformResumeActionDelete } from "./platform-resume-action-delete";
import { PlatformResumeActionRename } from "./platform-resume-action-rename";

interface PlatformSidebarResumeItemProps {
  resume: ResumeIndexEntry;
}

export function PlatformSidebarResumeItem({
  resume,
}: PlatformSidebarResumeItemProps) {
  const { id } = useParams<{ id?: string }>();
  const duplicateResume = useResumeStore((state) => state.duplicateResume);
  const [open, setOpen] = useState({ rename: false, remove: false });
  const t = useTranslations("platform.sidebar");

  const onDuplicate = () => {
    void duplicateResume(resume.id, t("copyOf", { title: resume.title }));
  };

  const openRenameDialog = (e: BaseUIEvent<MouseEvent>) => {
    e.preventDefault();
    setOpen((prev) => ({ ...prev, rename: true }));
  };
  const onOpenRename = (next: boolean) => {
    setOpen((prev) => ({ ...prev, rename: next }));
  };

  const openRemoveDialog = (e: BaseUIEvent<MouseEvent>) => {
    e.preventDefault();
    setOpen((prev) => ({ ...prev, remove: true }));
  };
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
      </SidebarMenuButton>

      <DropdownMenu>
        <DropdownMenuTrigger
          render={<SidebarMenuAction className="right-3.5" />}
        >
          <span className="sr-only">{t("itemMenu")}</span>
          <MoreVertical />
        </DropdownMenuTrigger>

        <DropdownMenuContent align="start">
          <DropdownMenuGroup>
            <DropdownMenuLabel className="sr-only">
              {t.rich("modify", {
                title: resume.title,
                b: (chunks) => <strong>{chunks}</strong>,
              })}
            </DropdownMenuLabel>
            <DropdownMenuItem onClick={openRenameDialog}>
              <Pen />
              {t("rename")}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onDuplicate}>
              <Copy />
              {t("duplicate")}
            </DropdownMenuItem>

            {id !== resume.id && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  variant="destructive"
                  onClick={openRemoveDialog}
                >
                  <Trash />
                  {t("delete")}
                </DropdownMenuItem>
              </>
            )}
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
    </SidebarMenuItem>
  );
}
