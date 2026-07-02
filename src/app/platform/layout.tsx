import type { PropsWithChildren } from "react";
import { PlatformNavbar } from "@/components/platform/platform-navbar";
import { PlatformSidebar } from "@/components/platform/platform-sidebar";
import {
  Sidebar,
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar";

export default function PlatformLayout({ children }: PropsWithChildren) {
  return (
    <SidebarProvider>
      <Sidebar>
        <PlatformSidebar />
      </Sidebar>

      <SidebarInset>
        <PlatformNavbar />
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
