import { Sidebar, SidebarInset } from "@lanjut/ui/components/sidebar";
import type { PropsWithChildren } from "react";
import { PlatformDatabaseNotice } from "@/components/platform/platform-database-notice";
import { PlatformFeedbackSheet } from "@/components/platform/platform-feedback-sheet";
import { PlatformNavbar } from "@/components/platform/platform-navbar";
import { PlatformOfflineCache } from "@/components/platform/platform-offline-cache";
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
            second row a definite track, so each page scrolls inside it. From
            md the navbar sits on the shell's own background, beside the
            sidebar, and drops the inset variant's margins and rounding. */}
        <SidebarInset className="grid h-svh min-w-0 grid-rows-[auto_minmax(0,1fr)] overflow-hidden md:bg-sidebar md:peer-data-[variant=inset]:m-0 md:peer-data-[variant=inset]:rounded-none md:peer-data-[variant=inset]:shadow-none md:peer-data-[variant=inset]:peer-data-[state=collapsed]:ml-0">
          <PlatformNavbar />
          {/* The page panel. Only its top-left corner rounds, and it runs to
              the window's right and bottom edges, so the page gets the room. */}
          <div className="grid min-h-0 min-w-0 grid-cols-[minmax(0,1fr)] grid-rows-[minmax(0,1fr)] overflow-hidden bg-background md:rounded-tl-xl md:border-t md:border-l">
            {props.children}
          </div>
        </SidebarInset>

        <ProfileSettings />
        <PlatformDatabaseNotice />
        <PlatformOfflineCache />

        {/* The desktop app files feedback through a hosted window, so this
            never opens there and its bot-check widget cannot run on its origin. */}
        {!IS_DESKTOP && <PlatformFeedbackSheet />}
      </PlatformSidebarProvider>
    </TourProvider>
  );
}
