import { cn } from "@lanjut/ui/lib/utils";
import { type ReactNode, useId } from "react";

interface LandingLooksRowFrameProps {
  open: boolean;
  onSelect: () => void;
  title: string;
  aside?: string;
  children: ReactNode;
}

/**
 * One row of the looks list: a button that opens it, and a body that grows
 * open below. A closed body stays in the HTML, so crawlers read every row.
 */
export function LandingLooksRowFrame(props: LandingLooksRowFrameProps) {
  const bodyId = useId();

  return (
    <li
      className={cn(
        "-ml-px border-l-2 pl-5 transition-colors duration-300 motion-reduce:transition-none",
        props.open ? "border-primary" : "border-transparent",
      )}
    >
      <h3>
        <button
          type="button"
          aria-expanded={props.open}
          aria-controls={bodyId}
          onClick={props.onSelect}
          className="flex min-h-11 w-full items-baseline justify-between gap-4 rounded-xs py-2 text-left outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <span
            className={cn(
              "text-lg font-bold tracking-[-0.01em] transition-colors",
              !props.open && "text-muted-foreground hover:text-foreground",
            )}
          >
            {props.title}
          </span>
          {props.aside && (
            <span className="text-right text-xs text-muted-foreground">
              {props.aside}
            </span>
          )}
        </button>
      </h3>
      <div
        id={bodyId}
        inert={!props.open}
        className={cn(
          "grid grid-rows-[0fr] opacity-0 transition-[grid-template-rows,opacity] duration-300 ease-out motion-reduce:transition-none",
          props.open && "grid-rows-[1fr] opacity-100",
        )}
      >
        <div className="min-h-0 overflow-hidden">
          <div className="pt-1 pb-4">{props.children}</div>
        </div>
      </div>
    </li>
  );
}
