import { SidebarFooter } from "../ui/sidebar";
import { PlatformNavbarChangelog } from "./platform-navbar-changelog";

/**
 * The what's-new control, shown in the sidebar sheet below the `lg`
 * breakpoint. Above it the control lives in the navbar.
 */
export function PlatformSidebarSettings() {
  return (
    <SidebarFooter className="border-t lg:hidden">
      <div className="flex items-center gap-2">
        <PlatformNavbarChangelog />
      </div>
    </SidebarFooter>
  );
}
