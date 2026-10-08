import { Sidebar, SidebarInset } from "@lanjut/ui/components/sidebar";
import type { PropsWithChildren } from "react";
import { PlatformBugReportDialog } from "@/components/platform/platform-bug-report-dialog";
import { PlatformDatabaseNotice } from "@/components/platform/platform-database-notice";
import { PlatformFeatureRequestDialog } from "@/components/platform/platform-feature-request-dialog";
import { PlatformNavbar } from "@/components/platform/platform-navbar";
import { PlatformSidebar } from "@/components/platform/platform-sidebar";
import { PlatformSidebarProvider } from "@/components/platform/platform-sidebar-provider";
import { ProfileSettings } from "@/components/profile/profile-settings";
import { TourProvider } from "@/components/tour/tour-provider";
import { IS_DESKTOP } from "@/lib/build-target";

/** The chrome every platform page shares: sidebar, navbar, tours, feedback. */
export function PlatformShell(props: PropsWithChildren) {
  return (
    <TourProvider>
      <PlatformSidebarProvider>
        <Sidebar variant="inset" collapsible="icon">
          <PlatformSidebar />
        </Sidebar>

        {/* min-w-0 lets this flex-1 region shrink instead of being forced wide
            by its content (e.g. a long custom-section title), which otherwise
            pushes the layout past the viewport. The fixed height makes the
            second row a definite track, so each page scrolls inside it. */}
        <SidebarInset className="grid h-svh min-w-0 grid-rows-[auto_minmax(0,1fr)] overflow-hidden md:h-[calc(100svh-1rem)]">
          <PlatformNavbar />
          {props.children}
        </SidebarInset>

        <ProfileSettings />
        <PlatformDatabaseNotice />

        {/* The desktop app files feedback through a hosted window, so these
            never open there and their bot-check widget cannot run on its origin. */}
        {!IS_DESKTOP && (
          <>
            <PlatformBugReportDialog />
            <PlatformFeatureRequestDialog />
          </>
        )}
      </PlatformSidebarProvider>
    </TourProvider>
  );
}
