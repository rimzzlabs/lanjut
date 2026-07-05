import { SidebarContent } from "../ui/sidebar";
import { PlatformSidebarHeader } from "./platform-sidebar-header";
import { PlatformSidebarPlatform } from "./platform-sidebar-platform";
import { PlatformSidebarResume } from "./platform-sidebar-resume";

export function PlatformSidebar() {
  return (
    <SidebarContent>
      <PlatformSidebarHeader />
      <PlatformSidebarPlatform />
      <PlatformSidebarResume />
    </SidebarContent>
  );
}
