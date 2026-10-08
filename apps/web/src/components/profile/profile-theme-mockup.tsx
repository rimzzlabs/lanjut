import { cn } from "@lanjut/ui/lib/utils";

/**
 * The app in miniature, drawn with the real tokens: `.light` or `.dark`
 * re-points them for this subtree, so the picture always matches the theme
 * it names. The sidebar sits on `--sidebar`, the panel on `--background`, and
 * a résumé sheet stays white, as it does in the app.
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
        "flex size-full gap-1.5 bg-sidebar p-1.5 text-foreground",
        props.className,
      )}
    >
      <div className="flex w-1/4 flex-col gap-1.5 pt-1 pl-0.5">
        <div className="size-2 rounded-full bg-primary" />
        <div className="h-1 w-4/5 rounded-full bg-sidebar-accent" />
        <div className="h-1 w-3/5 rounded-full bg-muted-foreground/30" />
        <div className="h-1 w-2/3 rounded-full bg-muted-foreground/30" />
      </div>
      <div className="flex flex-1 flex-col gap-1.5 rounded-sm bg-background p-1.5 ring-1 ring-foreground/10">
        <div className="flex items-center justify-between">
          <div className="h-1 w-1/3 rounded-full bg-muted-foreground/40" />
          <div className="size-1.5 rounded-full bg-primary/40" />
        </div>
        <div className="flex flex-1 gap-1.5">
          <MockupSheet />
          <MockupSheet />
        </div>
        <div className="h-1.5 w-1/4 rounded-full bg-primary" />
      </div>
    </div>
  );
}

function MockupSheet() {
  return (
    <div className="flex flex-1 flex-col gap-0.5 rounded-xs bg-white p-1 shadow-xs ring-1 ring-black/5">
      <div className="h-0.5 w-1/2 rounded-full bg-neutral-400" />
      <div className="h-0.5 w-full rounded-full bg-neutral-200" />
      <div className="h-0.5 w-4/5 rounded-full bg-neutral-200" />
    </div>
  );
}
