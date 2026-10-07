import {
  BugIcon,
  PaperPlaneTiltIcon,
  QuestionIcon,
} from "@phosphor-icons/react";
import { useNextStep } from "nextstepjs";
import { useTranslations } from "use-intl";
import { useIssueReport } from "@/hooks/use-issue-report";
import { MEDIA_XL, useMediaQuery } from "@/hooks/use-media-query";
import { usePathname } from "@/i18n/navigation";
import { useResumeStore } from "@/lib/store";
import { EDITOR_SHEET_TOUR, EDITOR_TOUR, tourForPathname } from "@/lib/tour";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "../ui/sidebar";

export function PlatformSidebarOther() {
  const pathname = usePathname();
  const openStatus = useResumeStore((state) => state.openStatus);
  const openIssueReport = useIssueReport();
  const isDesktop = useMediaQuery(MEDIA_XL);
  const { startNextStep } = useNextStep();
  const { isMobile, setOpenMobile } = useSidebar();
  const t = useTranslations("platform.sidebar");

  const baseTour = tourForPathname(pathname);
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
            onClick={() => startNextStep(tour)}
          >
            <QuestionIcon /> {t("guide")}
          </SidebarMenuButton>
        </SidebarMenuItem>

        <SidebarMenuItem>
          <SidebarMenuButton
            onClick={() => {
              if (isMobile) setOpenMobile(false);
              openIssueReport("bug");
            }}
          >
            <BugIcon /> {t("reportBug")}
          </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarMenuButton
            onClick={() => {
              if (isMobile) setOpenMobile(false);
              openIssueReport("feature");
            }}
          >
            <PaperPlaneTiltIcon /> {t("featureRequest")}
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroup>
  );
}
