import {
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
} from "@lanjut/ui/components/sidebar";
import { PlatformSidebarChangelog } from "./platform-sidebar-changelog";

/** The app version, which opens the changelog. */
export function PlatformSidebarFooter() {
  return (
    <SidebarFooter className="border-t">
      <SidebarMenu>
        <SidebarMenuItem>
          <PlatformSidebarChangelog />
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarFooter>
  );
}
