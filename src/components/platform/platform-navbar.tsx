import { S } from "@mobily/ts-belt";
import { usePathname } from "@/i18n/navigation";
import { EditorSaveStatus } from "../editor/editor-save-status";
import { SiteSettingsMenu } from "../shared/site-settings-menu";
import { SiteThemeToggle } from "../shared/site-theme-toggle";
import { SidebarTrigger } from "../ui/sidebar";
import { PlatformNavbarBreadcrumb } from "./platform-navbar-breadcrumb";
import { PlatformNavbarChangelog } from "./platform-navbar-changelog";

export function PlatformNavbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 inset-x-0 z-50 border-b bg-background motion-safe:bg-background/50 motion-safe:backdrop-blur-sm">
      <div className="h-12 flex items-center gap-2 px-6">
        <SidebarTrigger />
        <PlatformNavbarBreadcrumb />
        {S.includes(pathname, "/editor") && (
          <div className="ml-2 inline-flex">
            <EditorSaveStatus />
          </div>
        )}

        <div className="inline-flex items-center gap-2 ml-auto">
          <div className="inline-flex max-lg:hidden">
            <PlatformNavbarChangelog />
          </div>
          <SiteThemeToggle variant="outline" />
          <SiteSettingsMenu variant="outline" />
        </div>
      </div>
    </header>
  );
}
