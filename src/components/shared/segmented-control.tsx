"use client";

import { Toggle } from "@base-ui/react/toggle";
import { ToggleGroup } from "@base-ui/react/toggle-group";
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

interface SegmentedControlProps {
  value: string;
  onValueChange: (value: string) => void;
  items: SegmentedItem[];
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
        const value = next[0];
        // Ignore deselection: a segmented control always keeps one active.
        if (value) props.onValueChange(value);
      }}
      className={cn(
        "inline-flex w-fit items-center rounded-lg border bg-muted p-0.5",
        props.className,
      )}
    >
      {props.items.map((item) => {
        const active = item.value === props.value;
        return (
          <Toggle
            key={item.value}
            value={item.value}
            aria-label={item.ariaLabel ?? item.label}
            className={cn(
              "relative inline-flex h-7 min-w-9 cursor-pointer items-center justify-center rounded-md px-2.5 text-xs font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring/50",
              active
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {active && (
              <motion.span
                aria-hidden
                layoutId={layoutId}
                className="absolute inset-0 rounded-md bg-background shadow-sm"
                transition={
                  reduceMotion
                    ? { duration: 0 }
                    : { type: "spring", stiffness: 500, damping: 40 }
                }
              />
            )}
            <span className="relative z-10">{item.label}</span>
          </Toggle>
        );
      })}
    </ToggleGroup>
  );
}
