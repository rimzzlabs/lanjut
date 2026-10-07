import { useTranslations } from "use-intl";
import { SidebarContent } from "../ui/sidebar";
import { PlatformSidebarHeader } from "./platform-sidebar-header";
import { PlatformSidebarOther } from "./platform-sidebar-other";
import { PlatformSidebarPlatform } from "./platform-sidebar-platform";
import { PlatformSidebarResume } from "./platform-sidebar-resume";
import { PlatformSidebarSettings } from "./platform-sidebar-settings";
import { PlatformSidebarSupport } from "./platform-sidebar-support";

export function PlatformSidebar() {
  const t = useTranslations("platform.sidebar");

  return (
    <>
      <SidebarContent>
        <nav aria-label={t("label")} className="flex flex-col gap-2">
          <PlatformSidebarHeader />
          <PlatformSidebarPlatform />
          <PlatformSidebarResume />
          <PlatformSidebarOther />
          <PlatformSidebarSupport />
        </nav>
      </SidebarContent>
      <PlatformSidebarSettings />
    </>
  );
}
