import { SidebarContent } from "../ui/sidebar";
import { PlatformSidebarHeader } from "./platform-sidebar-header";
import { PlatformSidebarOther } from "./platform-sidebar-other";
import { PlatformSidebarPlatform } from "./platform-sidebar-platform";
import { PlatformSidebarResume } from "./platform-sidebar-resume";
import { PlatformSidebarSettings } from "./platform-sidebar-settings";

export function PlatformSidebar() {
  return (
    <>
      <SidebarContent>
        <PlatformSidebarHeader />
        <PlatformSidebarPlatform />
        <PlatformSidebarResume />
        <PlatformSidebarOther />
      </SidebarContent>
      <PlatformSidebarSettings />
    </>
  );
}
