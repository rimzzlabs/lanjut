import { Toggle } from "@base-ui/react/toggle";
import { ToggleGroup } from "@base-ui/react/toggle-group";
import { A, O, pipe, S } from "@mobily/ts-belt";
import { motion, useReducedMotion } from "motion/react";
import { useId } from "react";
import { cn } from "@/lib/utils";

export interface SegmentedItem {
  value: string;
  /** Short visible label, e.g. "EN". */
  label: string;
  /** Full accessible name announced to assistive tech, e.g. "English". */
  ariaLabel?: string;
}

const INSTANT = { duration: 0 };
const PILL_SPRING = { type: "spring", stiffness: 500, damping: 40 } as const;

/**
 * The accessible name must contain the visible label (WCAG 2.5.3), so fold the
 * short label into the fuller aria label rather than replacing it.
 */
function accessibleNameOf(item: SegmentedItem) {
  if (!item.ariaLabel || item.ariaLabel === item.label) return item.label;
  return `${item.ariaLabel} (${item.label})`;
}

interface SegmentedControlProps {
  value: string;
  onValueChange: (value: string) => void;
  items: ReadonlyArray<SegmentedItem>;
  "aria-label": string;
  className?: string;
}

/**
 * Single-select segmented control. Built on base-ui's ToggleGroup for its
 * roving-focus keyboard support (arrow keys move, Space/Enter selects) and group
 * semantics; the active-segment pill animates between options via a shared
 * motion layout, honoring reduced-motion.
 */
export function SegmentedControl(props: SegmentedControlProps) {
  const layoutId = useId();
  const reduceMotion = useReducedMotion();

  return (
    <ToggleGroup
      aria-label={props["aria-label"]}
      value={[props.value]}
      onValueChange={(next) => {
        // Ignore deselection: a segmented control always keeps one active.
        pipe(next, A.head, O.filter(S.isNotEmpty), O.tap(props.onValueChange));
      }}
      className={cn(
        "inline-flex w-fit items-center rounded-2xl border bg-muted p-0.5",
        props.className,
      )}
    >
      {props.items.map((item) => {
        const active = item.value === props.value;
        const accessibleName = accessibleNameOf(item);
        return (
          <Toggle
            key={item.value}
            value={item.value}
            aria-label={accessibleName}
            className={cn(
              "relative inline-flex h-6 min-w-9 cursor-pointer items-center justify-center rounded-xl px-2.5 text-xs font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring/50",
              active && "text-foreground",
              !active && "text-muted-foreground hover:text-foreground",
            )}
          >
            {active && (
              <motion.span
                aria-hidden
                layoutId={layoutId}
                className="absolute inset-0 rounded-xl bg-background shadow-sm"
                transition={reduceMotion ? INSTANT : PILL_SPRING}
              />
            )}
            <span className="relative z-10">{item.label}</span>
          </Toggle>
        );
      })}
    </ToggleGroup>
  );
}
