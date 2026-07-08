"use client";

import { Bug, HelpCircle, Send } from "lucide-react";
import { useTranslations } from "next-intl";
import { useNextStep } from "nextstepjs";
import { MEDIA_XL, useMediaQuery } from "@/hooks/use-media-query";
import { usePathname } from "@/i18n/navigation";
import { useIssueReportStore, useResumeStore } from "@/lib/store";
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
  const setIssueReportOpen = useIssueReportStore((state) => state.setOpen);
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
            <HelpCircle /> {t("guide")}
          </SidebarMenuButton>
        </SidebarMenuItem>

        <SidebarMenuItem>
          <SidebarMenuButton
            onClick={() => {
              if (isMobile) setOpenMobile(false);
              setIssueReportOpen("bug");
            }}
          >
            <Bug /> {t("reportBug")}
          </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarMenuButton
            onClick={() => {
              if (isMobile) setOpenMobile(false);
              setIssueReportOpen("feature");
            }}
          >
            <Send /> {t("featureRequest")}
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroup>
  );
}
