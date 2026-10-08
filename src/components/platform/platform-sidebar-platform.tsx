import { S } from "@mobily/ts-belt";
import { LayoutIcon, SquaresFourIcon } from "@phosphor-icons/react";
import { useTranslations } from "use-intl";
import { useWorkspaceView } from "@/hooks/use-workspace-view";
import { Link, usePathname } from "@/i18n/navigation";
import { EDITOR_PATHNAME, TEMPLATE_PATHNAME } from "@/lib/routes";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "../ui/sidebar";

export function PlatformSidebarPlatform() {
  const pathname = usePathname();
  const view = useWorkspaceView();
  const t = useTranslations("platform.sidebar");

  return (
    <SidebarGroup id="tour-sidebar-nav">
      <SidebarGroupLabel>{t("platform")}</SidebarGroupLabel>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton
            isActive={
              view === "library" && S.startsWith(pathname, EDITOR_PATHNAME)
            }
            render={<Link href={EDITOR_PATHNAME} />}
          >
            <LayoutIcon /> {t("dashboard")}
          </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarMenuButton
            isActive={S.startsWith(pathname, TEMPLATE_PATHNAME)}
            render={<Link href={TEMPLATE_PATHNAME} />}
          >
            <SquaresFourIcon /> {t("browseTemplate")}
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroup>
  );
}
