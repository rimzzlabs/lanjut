"use client";

import dynamic from "next/dynamic";
import { Button } from "../ui/button";
import { SidebarTrigger } from "../ui/sidebar";
import { Skeleton } from "../ui/skeleton";
import { Spinner } from "../ui/spinner";
import { PlatformNavbarBreadcrumb } from "./platform-navbar-breadcrumb";
import { PlatformNavbarDownload } from "./platform-navbar-download";

const PlatformNavbarTheme = dynamic(
  () => import("./platform-navbar-theme").then((m) => m.PlatformNavbarTheme),
  {
    ssr: false,
    loading: () => (
      <Button variant="secondary" className="w-24">
        <Spinner className="stroke-muted-foreground/25" />
        <Skeleton className="h-4 w-12 bg-muted-foreground/10" />
      </Button>
    ),
  },
);

export function PlatformNavbar() {
  return (
    <header className="sticky top-0 inset-x-0 z-50 border-b bg-background motion-safe:bg-background/50 motion-safe:backdrop-blur-sm">
      <nav className="h-12 flex items-center gap-2 px-6">
        <SidebarTrigger />
        <PlatformNavbarBreadcrumb />

        <div className="hidden lg:inline-flex items-center gap-2 ml-auto">
          <PlatformNavbarTheme />
          <PlatformNavbarDownload />
        </div>
      </nav>
    </header>
  );
}
