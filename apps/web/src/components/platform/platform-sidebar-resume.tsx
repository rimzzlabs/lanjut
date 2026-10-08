import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@lanjut/ui/components/empty";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuSkeleton,
} from "@lanjut/ui/components/sidebar";
import { A } from "@mobily/ts-belt";
import { TrayIcon } from "@phosphor-icons/react";
import { useTranslations } from "use-intl";
import { useHydrateResumeLibrary } from "@/hooks/use-hydrate-resume-library";
import { useResumeStore } from "@/lib/store";
import { PlatformSidebarResumeCreate } from "./platform-sidebar-resume-create";
import { PlatformSidebarResumeItem } from "./platform-sidebar-resume-item";

const SKELETON_KEYS = ["a", "b", "c"];

export function PlatformSidebarResume() {
  useHydrateResumeLibrary();
  const index = useResumeStore((state) => state.index);
  const indexStatus = useResumeStore((state) => state.indexStatus);
  const t = useTranslations("platform.sidebar");
  const ready = indexStatus === "ready";

  return (
    <SidebarGroup id="tour-sidebar-resumes">
      <SidebarGroupLabel>
        <span>{t("myResume")}</span>

        <PlatformSidebarResumeCreate />
      </SidebarGroupLabel>

      <SidebarMenu>
        {!ready &&
          SKELETON_KEYS.map((key) => (
            <SidebarMenuItem key={key}>
              <SidebarMenuSkeleton />
            </SidebarMenuItem>
          ))}
        {ready && A.isEmpty(index) && (
          <SidebarMenuItem>
            <Empty className="px-2 py-3 border border-dashed">
              <EmptyContent>
                <EmptyHeader>
                  <EmptyMedia variant="icon" className="size-8">
                    <TrayIcon className="size-3.5" />
                  </EmptyMedia>

                  <EmptyTitle className="text-xs">{t("noResume")}</EmptyTitle>
                  <EmptyDescription className="text-[0.6875rem]">
                    {t("noResumeDescription")}
                  </EmptyDescription>
                </EmptyHeader>
              </EmptyContent>
            </Empty>
          </SidebarMenuItem>
        )}
        {ready &&
          index.map((resume) => (
            <PlatformSidebarResumeItem key={resume.id} resume={resume} />
          ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
