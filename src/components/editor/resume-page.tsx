import type { CSSProperties, ReactNode } from "react";
import { A4 } from "./resume-geometry";

interface ResumePageProps {
  children: ReactNode;
  page: number;
  total: number;
}

/**
 * A résumé is always dark ink on white paper, independent of the app theme, so
 * the page pins `--foreground`/`--muted-foreground` to light-mode ink values
 * rather than inheriting the surrounding theme tokens.
 */
const PAPER_STYLE: CSSProperties = {
  width: A4.widthPx,
  height: A4.heightPx,
  padding: A4.marginPx,
  ["--foreground" as string]: "var(--color-neutral-950)",
  ["--muted-foreground" as string]: "var(--color-neutral-600)",
};

/**
 * A single, exact A4 page frame. Fixed width and height with `overflow-hidden`
 * so content never spills past the page bounds; the paginator is responsible
 * for placing only what fits (see `paginate`).
 */
export function ResumePage(props: ResumePageProps) {
  return (
    <div
      className="relative mx-auto overflow-hidden rounded border bg-white text-foreground shadow-sm"
      style={PAPER_STYLE}
    >
      {props.children}
      <p className="text-[0.6875rem] text-muted-foreground/70 absolute bottom-4 right-4">
        <span className="sr-only">Page</span> {props.page}/{props.total}
      </p>
    </div>
  );
}
