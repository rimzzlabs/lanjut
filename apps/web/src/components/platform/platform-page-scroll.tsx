import { ScrollArea } from "@lanjut/ui/components/scroll-area";
import type { ReactNode } from "react";
import { PAGE_SCROLL_ID } from "@/lib/page-scroll";

/**
 * The scroll region of a library or template page. The shell holds the page in
 * a fixed-height grid track, so the navbar stays put and the rounded panel
 * clips the content.
 */
export function PlatformPageScroll(props: { children: ReactNode }) {
  return (
    <ScrollArea id={PAGE_SCROLL_ID} className="min-h-0">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 p-4 md:p-6 lg:p-8">
        {props.children}
      </div>
    </ScrollArea>
  );
}
