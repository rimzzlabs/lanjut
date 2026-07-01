import { SidebarContent } from "../ui/sidebar";
import { PlatformSidebarPlatform } from "./platform-sidebar-platform";
import { PlatformSidebarResume } from "./platform-sidebar-resume";

export function PlatformSidebar() {
  return (
    <SidebarContent>
      <PlatformSidebarPlatform />
      <PlatformSidebarResume />
    </SidebarContent>
  );
}
