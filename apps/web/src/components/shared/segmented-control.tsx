import {
  ToggleGroup,
  ToggleGroupItem,
} from "@lanjut/ui/components/toggle-group";
import { cn } from "@lanjut/ui/lib/utils";
import { A, O, pipe, S } from "@mobily/ts-belt";
import { motion } from "motion/react";
import { useId } from "react";
import { useReducedMotionPreference } from "@/hooks/use-reduced-motion-preference";

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
 * Single-select segmented control. Built on the ToggleGroup primitive for its
 * roving-focus keyboard support (arrow keys move, Space/Enter selects) and group
 * semantics; the active-segment pill animates between options via a shared
 * motion layout, honoring reduced-motion. The pill draws the active background,
 * so the items drop the primitive's pressed and hover fills.
 */
export function SegmentedControl(props: SegmentedControlProps) {
  const layoutId = useId();
  const reduceMotion = useReducedMotionPreference();

  return (
    <ToggleGroup
      aria-label={props["aria-label"]}
      value={[props.value]}
      onValueChange={(next) => {
        // Ignore deselection: a segmented control always keeps one active.
        pipe(next, A.head, O.filter(S.isNotEmpty), O.tap(props.onValueChange));
      }}
      size="xs"
      className={cn(
        "inline-flex w-fit items-center gap-0 rounded-2xl border bg-muted p-0.5",
        props.className,
      )}
    >
      {props.items.map((item) => {
        const active = item.value === props.value;
        const accessibleName = accessibleNameOf(item);
        return (
          <ToggleGroupItem
            key={item.value}
            value={item.value}
            aria-label={accessibleName}
            className={cn(
              "relative min-w-9 cursor-pointer rounded-xl px-2.5 text-xs transition-colors hover:bg-transparent focus-visible:ring-2 aria-pressed:bg-transparent",
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
          </ToggleGroupItem>
        );
      })}
    </ToggleGroup>
  );
}
