import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import type { PropsWithChildren } from "react";
import { PlatformBugReportDialog } from "@/components/platform/platform-bug-report-dialog";
import { PlatformFeatureRequestDialog } from "@/components/platform/platform-feature-request-dialog";
import { PlatformNavbar } from "@/components/platform/platform-navbar";
import { PlatformSidebar } from "@/components/platform/platform-sidebar";
import { PlatformSidebarProvider } from "@/components/platform/platform-sidebar-provider";
import { TourProvider } from "@/components/tour/tour-provider";
import { Sidebar, SidebarInset } from "@/components/ui/sidebar";
import { IS_DESKTOP } from "@/lib/build-target";

// The platform is the local-first working area: its pages render each visitor's
// own IndexedDB data, so there is nothing meaningful for crawlers to index.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function PlatformLayout(
  props: PropsWithChildren<{ params: Promise<{ locale: string }> }>,
) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  const children = props.children;

  return (
    <TourProvider>
      <PlatformSidebarProvider>
        <Sidebar>
          <PlatformSidebar />
        </Sidebar>

        {/* min-w-0 lets this flex-1 region shrink instead of being forced wide
            by its content (e.g. a long custom-section title), which otherwise
            pushes the layout past the viewport. */}
        <SidebarInset className="min-w-0">
          <PlatformNavbar />
          {children}
        </SidebarInset>

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
