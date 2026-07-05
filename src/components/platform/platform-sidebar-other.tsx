"use client";

import { HelpCircle } from "lucide-react";
import { usePathname } from "next/navigation";
import { useNextStep } from "nextstepjs";
import { MEDIA_XL, useMediaQuery } from "@/hooks/use-media-query";
import { useResumeStore } from "@/lib/store";
import { EDITOR_TOUR, tourForPathname } from "@/lib/tour";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "../ui/sidebar";

export function PlatformSidebarOther() {
  const pathname = usePathname();
  const openStatus = useResumeStore((state) => state.openStatus);
  const isDesktop = useMediaQuery(MEDIA_XL);
  const { startNextStep } = useNextStep();

  const tour = tourForPathname(pathname);
  const guideDisabled =
    tour === EDITOR_TOUR && (openStatus !== "ready" || !isDesktop);

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
      </SidebarMenu>
    </SidebarGroup>
  );
}
