"use client";

import { Layout, LayoutTemplate } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "../ui/sidebar";

export function PlatformSidebarPlatform() {
  const pathname = usePathname();

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Platform</SidebarGroupLabel>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton
            isActive={pathname === "/platform"}
            render={<Link href="/platform" />}
          >
            <Layout /> Dashboard
          </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarMenuButton
            isActive={pathname.endsWith("/template")}
            render={<Link href="/platform/template" />}
          >
            <LayoutTemplate /> Browse Template
          </SidebarMenuButton>
        </SidebarMenuItem>
        {/* wired with react tour */}
        {/* <SidebarMenuItem>
          <SidebarMenuButton disabled>
            <HelpCircle /> Guide
          </SidebarMenuButton>
        </SidebarMenuItem> */}
      </SidebarMenu>
    </SidebarGroup>
  );
}
