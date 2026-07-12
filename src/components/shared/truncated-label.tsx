"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface TruncatedLabelProps {
  text: string;
  className?: string;
}

/**
 * Renders text on a single line, truncated with an ellipsis. When (and only
 * when) the text actually overflows its container, it exposes the full value via
 * the native `title` tooltip on hover. A native title is used deliberately: it
 * works everywhere the label appears (including a trigger nested inside a
 * collapsed accordion button, where a portalled tooltip did not open reliably).
 * Relies on the parent allowing the label to shrink (e.g. a flex row `min-w-0`).
 */
export function TruncatedLabel(props: TruncatedLabelProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const [truncated, setTruncated] = useState(false);

  // biome-ignore lint/correctness/useExhaustiveDependencies: `props.text` is a deliberate re-run trigger; changing the text alters scrollWidth without resizing the observed box, so the ResizeObserver alone would miss a short→long content change.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    const check = () => setTruncated(el.scrollWidth > el.clientWidth);
    // Measure after the next paint so layout (and the min-w-0 flex constraint) is
    // settled; a synchronous measure on mount can read a not-yet-constrained box.
    const schedule = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(check);
    };
    schedule();
    const observer = new ResizeObserver(schedule);
    observer.observe(el);
    // A web font swap changes the text's rendered width without resizing the
    // element's (flex-constrained) box, so the ResizeObserver never fires; re-check
    // once fonts are ready.
    document.fonts?.ready.then(schedule);
    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
    };
  }, [props.text]);

  return (
    <span
      ref={ref}
      title={truncated ? props.text : undefined}
      className={cn("block truncate", props.className)}
    >
      {props.text}
    </span>
  );
}
