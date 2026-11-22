import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@lanjut/ui/components/sidebar";
import { PlugsConnectedIcon } from "@phosphor-icons/react";
import { useTranslations } from "use-intl";
import {
  selectConnected,
  useAssistantStore,
} from "@/lib/store/assistant-store";
import { useProfileSettingsStore } from "@/lib/store/profile-settings-store";

/**
 * The mark that shows while an AI assistant is connected. It opens the
 * settings where the person can turn the assistant off. Only the desktop app
 * reports a status, so it never shows on the web or in the static shell.
 */
export function PlatformSidebarAssistant() {
  const t = useTranslations("platform.sidebar");
  const connected = useAssistantStore(selectConnected);
  const openAt = useProfileSettingsStore((state) => state.openAt);

  if (!connected) return null;
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          tooltip={t("assistantConnected")}
          onClick={() => openAt("assistant")}
        >
          <PlugsConnectedIcon />
          <span className="truncate">{t("assistantConnected")}</span>
          <span
            aria-hidden
            className="ml-auto size-2 shrink-0 rounded-full bg-primary group-data-[collapsible=icon]:absolute group-data-[collapsible=icon]:top-1 group-data-[collapsible=icon]:right-1"
          />
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
