import type { ScrollChange, ScrollDirection } from "@/lib/scroll-direction";

export type HeaderState = "top" | "hidden" | "pill";

const TOP_OFFSET_PX = 64;

const STATE_BY_DIRECTION: Record<ScrollDirection, HeaderState> = {
  down: "hidden",
  up: "pill",
};

export function nextHeaderState(
  previous: HeaderState,
  change: ScrollChange,
): HeaderState {
  if (change.scroll <= 0) return "top";
  if (previous === "top" && change.scroll < TOP_OFFSET_PX) return "top";
  return STATE_BY_DIRECTION[change.direction];
}

/** The mobile bar has no top state: it hides going down and returns going up. */
export function isMobileBarHidden(change: ScrollChange) {
  return change.direction === "down" && change.scroll > TOP_OFFSET_PX;
}
