"use client";

import { Bug, HelpCircle, HelpingHand } from "lucide-react";
import { usePathname } from "next/navigation";
import { useNextStep } from "nextstepjs";
import { MEDIA_XL, useMediaQuery } from "@/hooks/use-media-query";
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

  const baseTour = tourForPathname(pathname);
  const tour =
    baseTour === EDITOR_TOUR && !isDesktop ? EDITOR_SHEET_TOUR : baseTour;
  const guideDisabled = baseTour === EDITOR_TOUR && openStatus !== "ready";

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Other</SidebarGroupLabel>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton
            id="tour-guide"
            disabled={guideDisabled}
            onClick={() => startNextStep(tour)}
          >
            <HelpCircle /> Guide
          </SidebarMenuButton>
        </SidebarMenuItem>

        <SidebarMenuItem>
          <SidebarMenuButton
            onClick={() => {
              if (isMobile) setOpenMobile(false);
              setIssueReportOpen("bug");
            }}
          >
            <Bug /> Report a bug
          </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarMenuButton
            onClick={() => {
              if (isMobile) setOpenMobile(false);
              setIssueReportOpen("feature");
            }}
          >
            <HelpingHand /> Feature request
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroup>
  );
}
