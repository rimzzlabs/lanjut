import { cn } from "@lanjut/ui/lib/utils";

/**
 * A résumé page while it loads: white paper with faint lines where the name,
 * contacts, and sections will be. The page is white in both themes, so the
 * hand-over to the real render never flashes. Sizes are in container units,
 * so the page reads the same at 40px wide and at 240px.
 */
export function PlatformPaperSkeleton(props: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn(
        "@container aspect-210/297 w-full overflow-hidden bg-white",
        props.className,
      )}
    >
      <div className="flex h-full animate-pulse flex-col gap-[8cqw] px-[9cqw] py-[10cqw]">
        <div className="flex items-start justify-between gap-[6cqw]">
          <div className="flex w-1/2 flex-col gap-[2.5cqw]">
            <PaperLine className="h-[3.5cqw] w-[85%] bg-neutral-200" />
            <PaperLine className="w-[55%]" />
          </div>
          <div className="flex w-[35%] flex-col items-end gap-[1.8cqw]">
            <PaperLine className="w-[80%]" />
            <PaperLine className="w-full" />
            <PaperLine className="w-[65%]" />
          </div>
        </div>
        <PaperSection heading="w-[28%]" lines={PROSE} />
        <PaperSection heading="w-[34%]" lines={ENTRY} />
        <PaperSection heading="w-[24%]" lines={SHORT} />
      </div>
    </div>
  );
}

const PROSE = ["w-full", "w-[94%]", "w-[70%]"];
const ENTRY = ["w-[45%]", "w-[92%]", "w-[86%]", "w-[60%]"];
const SHORT = ["w-[80%]", "w-[50%]"];

function PaperSection(props: { heading: string; lines: string[] }) {
  return (
    <div className="flex flex-col gap-[2.5cqw]">
      <div className="flex items-center gap-[2cqw]">
        <PaperLine className={cn("h-[2.2cqw] bg-neutral-200", props.heading)} />
        <div className="h-px flex-1 bg-neutral-100" />
      </div>
      {props.lines.map((width) => (
        <PaperLine key={width} className={width} />
      ))}
    </div>
  );
}

function PaperLine(props: { className: string }) {
  return (
    <div
      className={cn("h-[1.6cqw] rounded-full bg-neutral-100", props.className)}
    />
  );
}
