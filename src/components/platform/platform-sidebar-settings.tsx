import { SidebarFooter } from "../ui/sidebar";
import { PlatformNavbarChangelog } from "./platform-navbar-changelog";
import { PlatformNavbarTheme } from "./platform-navbar-theme";

/**
 * The what's-new and theme controls, shown in the sidebar sheet below the `lg`
 * breakpoint. Above it these live in the navbar; here they keep the mobile
 * navbar down to just the download and language controls.
 */
export function PlatformSidebarSettings() {
  return (
    <SidebarFooter className="border-t lg:hidden">
      <div className="flex items-center gap-2">
        <PlatformNavbarChangelog />
        <PlatformNavbarTheme />
      </div>
    </SidebarFooter>
  );
}
