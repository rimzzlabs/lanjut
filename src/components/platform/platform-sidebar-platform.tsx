import { S } from "@mobily/ts-belt";
import { LayoutIcon, SquaresFourIcon } from "@phosphor-icons/react";
import { useTranslations } from "use-intl";
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
            <LayoutIcon /> {t("dashboard")}
          </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarMenuButton
            isActive={S.endsWith(pathname, "/template")}
            render={<Link href="/platform/template" />}
          >
            <SquaresFourIcon /> {t("browseTemplate")}
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroup>
  );
}
