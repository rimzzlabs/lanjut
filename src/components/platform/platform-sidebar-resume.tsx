"use client";

import { Inbox } from "lucide-react";
import { useHydrateResumeLibrary } from "@/hooks/use-hydrate-resume-library";
import { useResumeStore } from "@/lib/store";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "../ui/empty";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuSkeleton,
} from "../ui/sidebar";
import { PlatformSidebarResumeCreate } from "./platform-sidebar-resume-create";
import { PlatformSidebarResumeItem } from "./platform-sidebar-resume-item";

const SKELETON_KEYS = ["a", "b", "c"];

export function PlatformSidebarResume() {
  useHydrateResumeLibrary();
  const index = useResumeStore((state) => state.index);
  const indexStatus = useResumeStore((state) => state.indexStatus);

  return (
    <SidebarGroup id="tour-sidebar-resumes">
      <SidebarGroupLabel>
        <span>My Résumé</span>

        <PlatformSidebarResumeCreate />
      </SidebarGroupLabel>

      <SidebarMenu>
        {indexStatus !== "ready" ? (
          SKELETON_KEYS.map((key) => (
            <SidebarMenuItem key={key}>
              <SidebarMenuSkeleton />
            </SidebarMenuItem>
          ))
        ) : index.length === 0 ? (
          <SidebarMenuItem>
            <Empty className="px-2 py-3 border border-dashed">
              <EmptyContent>
                <EmptyHeader>
                  <EmptyMedia variant="icon" className="size-8">
                    <Inbox className="size-3.5" />
                  </EmptyMedia>

                  <EmptyTitle className="text-xs">No résumé yet</EmptyTitle>
                  <EmptyDescription className="text-[0.6875rem]">
                    When you add résumé, they will be visible here.
                  </EmptyDescription>
                </EmptyHeader>
              </EmptyContent>
            </Empty>
          </SidebarMenuItem>
        ) : (
          index.map((resume) => (
            <PlatformSidebarResumeItem key={resume.id} resume={resume} />
          ))
        )}
      </SidebarMenu>
    </SidebarGroup>
  );
}
