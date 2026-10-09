import { Progress as ProgressPrimitive } from "@base-ui/react/progress";
import { cn } from "../lib/utils";

// pathLength 100 lets the dash array read as a percent of the ring.
const RING = { cx: 18, cy: 18, r: 15.5, fill: "none", strokeWidth: 3 };

/**
 * A round progress meter: a ring that fills clockwise from the top, with
 * `children`, usually the value, in its middle. It keeps the progressbar role
 * and value of `Progress`. Size it through `className`.
 */
function ProgressRing({
  className,
  children,
  value,
  ...props
}: ProgressPrimitive.Root.Props) {
  const percent = Math.min(100, Math.max(0, value ?? 0));

  return (
    <ProgressPrimitive.Root
      value={value}
      data-slot="progress-ring"
      className={cn(
        "relative inline-grid size-16 shrink-0 place-items-center",
        className,
      )}
      {...props}
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 36 36"
        className="col-start-1 row-start-1 size-full -rotate-90"
      >
        <circle {...RING} className="stroke-muted" />
        {percent > 0 && (
          <circle
            {...RING}
            pathLength={100}
            strokeDasharray={`${percent} 100`}
            strokeLinecap="round"
            className="stroke-primary transition-[stroke-dasharray] duration-500"
          />
        )}
      </svg>
      <span className="col-start-1 row-start-1">{children}</span>
    </ProgressPrimitive.Root>
  );
}

export { ProgressRing };
