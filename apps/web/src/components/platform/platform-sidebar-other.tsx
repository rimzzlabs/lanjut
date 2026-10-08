import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@lanjut/ui/components/sidebar";
import { ChatCircleTextIcon, QuestionIcon } from "@phosphor-icons/react";
import { useNextStep } from "nextstepjs";
import { useTranslations } from "use-intl";
import { MEDIA_XL, useMediaQuery } from "@/hooks/use-media-query";
import { useOpenFeedback } from "@/hooks/use-open-feedback";
import { useWorkspaceView } from "@/hooks/use-workspace-view";
import { usePathname } from "@/i18n/navigation";
import { useResumeStore } from "@/lib/store";
import { EDITOR_SHEET_TOUR, EDITOR_TOUR, tourForPathname } from "@/lib/tour";
import { preloadFeedbackFlow } from "./platform-feedback-sheet";

export function PlatformSidebarOther() {
  const pathname = usePathname();
  const view = useWorkspaceView();
  const openStatus = useResumeStore((state) => state.openStatus);
  const openFeedback = useOpenFeedback();
  const isDesktop = useMediaQuery(MEDIA_XL);
  const { startNextStep } = useNextStep();
  const { isMobile, setOpenMobile } = useSidebar();
  const t = useTranslations("platform.sidebar");

  const baseTour = tourForPathname(pathname, view === "editor");
  const tour =
    baseTour === EDITOR_TOUR && !isDesktop ? EDITOR_SHEET_TOUR : baseTour;
  const guideDisabled = baseTour === EDITOR_TOUR && openStatus !== "ready";

  return (
    <SidebarGroup>
      <SidebarGroupLabel>{t("other")}</SidebarGroupLabel>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton
            id="tour-guide"
            disabled={guideDisabled}
            tooltip={t("guide")}
            onClick={() => startNextStep(tour)}
          >
            <QuestionIcon /> {t("guide")}
          </SidebarMenuButton>
        </SidebarMenuItem>

        <SidebarMenuItem>
          <SidebarMenuButton
            tooltip={t("feedback")}
            onPointerEnter={() => void preloadFeedbackFlow()}
            onFocus={() => void preloadFeedbackFlow()}
            onClick={() => {
              if (isMobile) setOpenMobile(false);
              openFeedback();
            }}
          >
            <ChatCircleTextIcon /> {t("feedback")}
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroup>
  );
}
