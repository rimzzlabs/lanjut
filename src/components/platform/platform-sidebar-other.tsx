import {
  BugIcon,
  PaperPlaneTiltIcon,
  QuestionIcon,
} from "@phosphor-icons/react";
import { useNextStep } from "nextstepjs";
import { useTranslations } from "use-intl";
import { useIssueReport } from "@/hooks/use-issue-report";
import { MEDIA_XL, useMediaQuery } from "@/hooks/use-media-query";
import { useWorkspaceView } from "@/hooks/use-workspace-view";
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
import {
  preloadBugReportForm,
  preloadFeatureRequestForm,
} from "./platform-feedback-forms";

export function PlatformSidebarOther() {
  const pathname = usePathname();
  const view = useWorkspaceView();
  const openStatus = useResumeStore((state) => state.openStatus);
  const openIssueReport = useIssueReport();
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
            onClick={() => startNextStep(tour)}
          >
            <QuestionIcon /> {t("guide")}
          </SidebarMenuButton>
        </SidebarMenuItem>

        <SidebarMenuItem>
          <SidebarMenuButton
            onPointerEnter={() => void preloadBugReportForm()}
            onFocus={() => void preloadBugReportForm()}
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
            onPointerEnter={() => void preloadFeatureRequestForm()}
            onFocus={() => void preloadFeatureRequestForm()}
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
