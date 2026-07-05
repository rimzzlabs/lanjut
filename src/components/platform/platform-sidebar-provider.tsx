"use client";

import { type ReactNode, useEffect } from "react";
import { useSidebarStore } from "@/lib/store";
import { SidebarProvider, useSidebar } from "../ui/sidebar";

export function PlatformSidebarProvider(props: { children: ReactNode }) {
  const open = useSidebarStore((state) => state.open);
  const setOpen = useSidebarStore((state) => state.setOpen);

  useEffect(() => {
    void useSidebarStore.persist.rehydrate();
  }, []);

  return (
    <SidebarProvider open={open} onOpenChange={setOpen}>
      <SidebarMobileBridge />
      {props.children}
    </SidebarProvider>
  );
}

// The shadcn provider keeps the mobile sheet state internal; registering its
// setter lets non-React callers (the tour) drive it through the store.
function SidebarMobileBridge() {
  const { setOpenMobile } = useSidebar();

  useEffect(() => {
    useSidebarStore.getState().registerMobileControl(setOpenMobile);
    return () => useSidebarStore.getState().registerMobileControl(null);
  }, [setOpenMobile]);

  return null;
}
