import { cn } from "@lanjut/ui/lib/utils";
import type { ReactNode } from "react";

interface ProfilePreferenceRowProps {
  label: string;
  description: string;
  children: ReactNode;
  /** Puts a wide control, such as the theme pictures, under its label. */
  stacked?: boolean;
}

/**
 * One preference: what it is on the left and its control on the right, or
 * its control below it when the control is wide.
 */
export function ProfilePreferenceRow(props: ProfilePreferenceRowProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 py-5",
        !props.stacked &&
          "sm:flex-row sm:items-center sm:justify-between sm:gap-6",
      )}
    >
      <div className="flex min-w-0 flex-col gap-0.5">
        <span className="text-sm font-medium">{props.label}</span>
        <span className="text-sm text-muted-foreground">
          {props.description}
        </span>
      </div>
      <div className={cn(!props.stacked && "shrink-0")}>{props.children}</div>
    </div>
  );
}
