import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
} from "@lanjut/ui/components/sidebar";
import { A } from "@mobily/ts-belt";
import { ArrowRightIcon } from "@phosphor-icons/react";
import { useTranslations } from "use-intl";
import { useHydrateResumeLibrary } from "@/hooks/use-hydrate-resume-library";
import {
  useProfileLibraryReady,
  useProfileResumes,
} from "@/hooks/use-profile-resumes";
import { Link } from "@/i18n/navigation";
import { EDITOR_PATHNAME } from "@/lib/routes";
import { PlatformSidebarResumeCreate } from "./platform-sidebar-resume-create";
import { PlatformSidebarResumeItem } from "./platform-sidebar-resume-item";

const RECENT_LIMIT = 5;
const SKELETON_KEYS = ["a", "b", "c"];

/**
 * The active profile's résumés edited last, newest first. With none saved
 * the group is left out: the library shows how to start one.
 */
export function PlatformSidebarResume() {
  useHydrateResumeLibrary();
  const index = useProfileResumes();
  const ready = useProfileLibraryReady();
  const t = useTranslations("platform.sidebar");
  const recent = A.take(index, RECENT_LIMIT);

  if (ready && A.isEmpty(index)) return null;

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>
        <span>{t("recent")}</span>

        <PlatformSidebarResumeCreate />
      </SidebarGroupLabel>

      <SidebarMenu>
        {!ready &&
          SKELETON_KEYS.map((key) => (
            <SidebarMenuItem key={key}>
              <SidebarMenuSkeleton />
            </SidebarMenuItem>
          ))}
        {ready &&
          recent.map((resume) => (
            <PlatformSidebarResumeItem key={resume.id} resume={resume} />
          ))}
        {ready && A.length(index) > RECENT_LIMIT && (
          <SidebarMenuItem>
            <SidebarMenuButton
              className="text-sidebar-foreground/70"
              render={<Link href={EDITOR_PATHNAME} />}
            >
              <ArrowRightIcon /> {t("viewAll")}
            </SidebarMenuButton>
          </SidebarMenuItem>
        )}
      </SidebarMenu>
    </SidebarGroup>
  );
}
