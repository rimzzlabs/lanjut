"use client";

import { LanguageSwitcher } from "../shared/language-switcher";
import { SidebarTrigger } from "../ui/sidebar";
import { PlatformNavbarBreadcrumb } from "./platform-navbar-breadcrumb";
import { PlatformNavbarChangelog } from "./platform-navbar-changelog";
import { PlatformNavbarDownload } from "./platform-navbar-download";
import { PlatformNavbarTheme } from "./platform-navbar-theme";

export function PlatformNavbar() {
  return (
    <header className="sticky top-0 inset-x-0 z-50 border-b bg-background motion-safe:bg-background/50 motion-safe:backdrop-blur-sm">
      <nav className="h-12 flex items-center gap-2 px-6">
        <SidebarTrigger />
        <PlatformNavbarBreadcrumb />

        <div className="inline-flex items-center gap-2 ml-auto">
          <div className="inline-flex items-center gap-2 max-lg:hidden">
            <PlatformNavbarChangelog />
            <PlatformNavbarTheme />
          </div>
          <PlatformNavbarDownload />
          <LanguageSwitcher />
        </div>
      </nav>
    </header>
  );
}
