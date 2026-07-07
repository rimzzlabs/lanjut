import type { Metadata } from "next";
import type { PropsWithChildren } from "react";
import { PlatformBugReportDialog } from "@/components/platform/platform-bug-report-dialog";
import { PlatformFeatureRequestDialog } from "@/components/platform/platform-feature-request-dialog";
import { PlatformNavbar } from "@/components/platform/platform-navbar";
import { PlatformSidebar } from "@/components/platform/platform-sidebar";
import { PlatformSidebarProvider } from "@/components/platform/platform-sidebar-provider";
import { TourProvider } from "@/components/tour/tour-provider";
import { Sidebar, SidebarInset } from "@/components/ui/sidebar";

// The platform is the local-first working area: its pages render each visitor's
// own IndexedDB data, so there is nothing meaningful for crawlers to index.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function PlatformLayout({ children }: PropsWithChildren) {
  return (
    <TourProvider>
      <PlatformSidebarProvider>
        <Sidebar>
          <PlatformSidebar />
        </Sidebar>

        <SidebarInset>
          <PlatformNavbar />
          {children}
        </SidebarInset>

        <PlatformBugReportDialog />
        <PlatformFeatureRequestDialog />
      </PlatformSidebarProvider>
    </TourProvider>
  );
}
