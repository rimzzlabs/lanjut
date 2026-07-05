import type { Metadata } from "next";
import type { PropsWithChildren } from "react";
import { PlatformNavbar } from "@/components/platform/platform-navbar";
import { PlatformSidebar } from "@/components/platform/platform-sidebar";
import { TourProvider } from "@/components/tour/tour-provider";
import {
  Sidebar,
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar";

// The platform is the local-first working area: its pages render each visitor's
// own IndexedDB data, so there is nothing meaningful for crawlers to index.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function PlatformLayout({ children }: PropsWithChildren) {
  return (
    <TourProvider>
      <SidebarProvider>
        <Sidebar>
          <PlatformSidebar />
        </Sidebar>

        <SidebarInset>
          <PlatformNavbar />
          {children}
        </SidebarInset>
      </SidebarProvider>
    </TourProvider>
  );
}
