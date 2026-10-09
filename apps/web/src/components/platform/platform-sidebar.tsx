import { SidebarContent, useSidebar } from "@lanjut/ui/components/sidebar";
import { useEffect } from "react";
import { useTranslations } from "use-intl";
import { APP_NAVIGATE_EVENT } from "./platform-app-router";
import { PlatformSidebarHeader } from "./platform-sidebar-header";
import { PlatformSidebarOther } from "./platform-sidebar-other";
import { PlatformSidebarPlatform } from "./platform-sidebar-platform";
import { PlatformSidebarResume } from "./platform-sidebar-resume";
import { PlatformSidebarSupport } from "./platform-sidebar-support";

export function PlatformSidebar() {
  const t = useTranslations("platform.sidebar");
  const { setOpenMobile } = useSidebar();

  // On a phone the sidebar is a sheet. A page load used to close it; a move
  // inside the app keeps the shell, so it closes when the router moves.
  useEffect(() => {
    function close() {
      setOpenMobile(false);
    }
    window.addEventListener(APP_NAVIGATE_EVENT, close);
    return () => window.removeEventListener(APP_NAVIGATE_EVENT, close);
  }, [setOpenMobile]);

  return (
    <SidebarContent>
      <nav aria-label={t("label")} className="flex flex-col gap-2">
        <PlatformSidebarHeader />
        <PlatformSidebarPlatform />
        <PlatformSidebarResume />
        <PlatformSidebarOther />
        <PlatformSidebarSupport />
      </nav>
    </SidebarContent>
  );
}
