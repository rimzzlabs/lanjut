import { cn } from "@lanjut/ui/lib/utils";

/**
 * The app in miniature, drawn with the real tokens: `.light` or `.dark`
 * re-points them for this subtree, so the picture always matches the theme
 * it names. The sidebar sits on `--sidebar`, the panel on `--background`, and
 * a résumé sheet stays white, as it does in the app.
 *
 * Every size is in container units of the picker item, so the miniature
 * keeps its proportions at any width. The panel sits 2.6cqw inside the
 * frame, so its radius is the frame's less that gap, and the corners stay
 * concentric.
 */
export function ProfileThemeMockup(props: {
  theme: "light" | "dark";
  className?: string;
}) {
  return (
    <div
      aria-hidden
      className={cn(
        props.theme,
        "flex size-full gap-[2.6cqw] bg-sidebar p-[2.6cqw] text-foreground",
        props.className,
      )}
    >
      <div className="flex w-1/4 flex-col gap-[2.4cqw] pt-[1.6cqw] pl-[0.8cqw]">
        <div className="size-[3.4cqw] rounded-full bg-primary" />
        <div className="h-[1.6cqw] w-4/5 rounded-full bg-sidebar-accent" />
        <div className="h-[1.6cqw] w-3/5 rounded-full bg-muted-foreground/30" />
        <div className="h-[1.6cqw] w-2/3 rounded-full bg-muted-foreground/30" />
      </div>
      <div className="flex flex-1 flex-col gap-[2.6cqw] rounded-[calc(1.8cqw-1px)] bg-background p-[2.6cqw] ring-1 ring-foreground/10">
        <div className="flex items-center justify-between">
          <div className="h-[1.6cqw] w-1/3 rounded-full bg-muted-foreground/40" />
          <div className="size-[2.4cqw] rounded-full bg-primary/40" />
        </div>
        <div className="flex flex-1 gap-[2.6cqw]">
          <MockupSheet />
          <MockupSheet />
        </div>
        <div className="h-[2.4cqw] w-1/4 rounded-full bg-primary" />
      </div>
    </div>
  );
}

function MockupSheet() {
  return (
    <div className="flex flex-1 flex-col gap-[0.8cqw] rounded-[0.6cqw] bg-white p-[1.6cqw] shadow-xs ring-1 ring-black/5">
      <div className="h-[0.8cqw] w-1/2 rounded-full bg-neutral-400" />
      <div className="h-[0.8cqw] w-full rounded-full bg-neutral-200" />
      <div className="h-[0.8cqw] w-4/5 rounded-full bg-neutral-200" />
    </div>
  );
}
