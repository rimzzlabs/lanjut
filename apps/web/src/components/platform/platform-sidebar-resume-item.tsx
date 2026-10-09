import type { ResumeIndexEntry } from "@lanjut/resume";
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
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@lanjut/ui/components/sidebar";
import {
  CopyIcon,
  DotsThreeVerticalIcon,
  FileTextIcon,
  PencilSimpleIcon,
  TrashIcon,
} from "@phosphor-icons/react";
import { type MouseEvent, useState } from "react";
import { useTranslations } from "use-intl";
import { useEditorId } from "@/hooks/use-editor-id";
import { Link } from "@/i18n/navigation";
import { editorHref } from "@/lib/routes";
import { useResumeStore } from "@/lib/store";
import { TruncatedLabel } from "../shared/truncated-label";
import { PlatformResumeActionDelete } from "./platform-resume-action-delete";
import { PlatformResumeActionRename } from "./platform-resume-action-rename";

interface PlatformSidebarResumeItemProps {
  resume: ResumeIndexEntry;
}

export function PlatformSidebarResumeItem(
  props: PlatformSidebarResumeItemProps,
) {
  const { resume } = props;
  const id = useEditorId();
  const duplicateResume = useResumeStore((state) => state.duplicateResume);
  const [open, setOpen] = useState({ rename: false, remove: false });
  const t = useTranslations("platform.sidebar");

  const onDuplicate = () => {
    void duplicateResume(resume.id, t("copyOf", { title: resume.title }));
  };

  const openRenameDialog = (e: MouseEvent) => {
    e.preventDefault();
    setOpen((prev) => ({ ...prev, rename: true }));
  };
  const onOpenRename = (next: boolean) => {
    setOpen((prev) => ({ ...prev, rename: next }));
  };

  const openRemoveDialog = (e: MouseEvent) => {
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
        render={<Link href={editorHref(resume.id)} />}
      >
        <FileTextIcon />
        <TruncatedLabel text={resume.title} className="min-w-0" />
      </SidebarMenuButton>

      <DropdownMenu>
        <DropdownMenuTrigger
          render={<SidebarMenuAction className="right-3.5" />}
        >
          <span className="sr-only">{t("itemMenu")}</span>
          <DotsThreeVerticalIcon />
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
              <PencilSimpleIcon />
              {t("rename")}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onDuplicate}>
              <CopyIcon />
              {t("duplicate")}
            </DropdownMenuItem>

            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onClick={openRemoveDialog}>
              <TrashIcon />
              {t("delete")}
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
    </SidebarMenuItem>
  );
}
