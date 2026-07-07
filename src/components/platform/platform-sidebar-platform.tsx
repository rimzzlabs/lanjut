"use client";

import { Layout, LayoutTemplate } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "../ui/sidebar";

export function PlatformSidebarPlatform() {
  const pathname = usePathname();
  const t = useTranslations("platform.sidebar");

  return (
    <SidebarGroup id="tour-sidebar-nav">
      <SidebarGroupLabel>{t("platform")}</SidebarGroupLabel>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton
            isActive={pathname === "/platform"}
            render={<Link href="/platform" />}
          >
            <Layout /> {t("dashboard")}
          </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarMenuButton
            isActive={pathname.endsWith("/template")}
            render={<Link href="/platform/template" />}
          >
            <LayoutTemplate /> {t("browseTemplate")}
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroup>
  );
}
