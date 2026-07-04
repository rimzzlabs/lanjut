import type { ReactNode } from "react";

/**
 * The card "desk": a dotted work surface with an A4 sheet resting on it. The
 * sheet is pinned near the top and clipped by the frame, so the paper visibly
 * runs past the bottom edge — the page continues — and lifts on card hover.
 */
export function PlatformPaperFrame(props: { children: ReactNode }) {
  return (
    <div className="relative aspect-4/3 overflow-hidden border-b bg-muted/40 bg-[radial-gradient(color-mix(in_oklab,var(--color-foreground)_7%,transparent)_1px,transparent_1px)] bg-size-[0.625rem_0.625rem]">
      <div className="absolute inset-x-5 top-5 overflow-hidden rounded-xs bg-white shadow-md ring-1 ring-black/5 transition-[translate,box-shadow] duration-300 ease-out group-hover/card:-translate-y-1 group-hover/card:shadow-lg motion-reduce:transition-none motion-reduce:group-hover/card:translate-y-0">
        {props.children}
      </div>
    </div>
  );
}
