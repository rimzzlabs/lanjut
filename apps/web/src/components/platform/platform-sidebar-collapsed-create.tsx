import {
  SidebarMenuButton,
  SidebarMenuItem,
} from "@lanjut/ui/components/sidebar";
import { FilePlusIcon } from "@phosphor-icons/react";
import { useState } from "react";
import { useTranslations } from "use-intl";
import { PlatformResumeCreateSheet } from "./platform-resume-create/platform-resume-create-sheet";

/**
 * The create action of the résumé group, which the icon rail hides. It shows
 * only while the sidebar is collapsed to icons.
 */
export function PlatformSidebarCollapsedCreate() {
  const [open, setOpen] = useState(false);
  const t = useTranslations("platform.sidebar");

  return (
    <SidebarMenuItem className="hidden group-data-[collapsible=icon]:block">
      <SidebarMenuButton
        tooltip={t("createResume")}
        onClick={() => setOpen(true)}
      >
        <FilePlusIcon /> {t("createResume")}
      </SidebarMenuButton>

      <PlatformResumeCreateSheet open={open} onOpenChange={setOpen} />
    </SidebarMenuItem>
  );
}
