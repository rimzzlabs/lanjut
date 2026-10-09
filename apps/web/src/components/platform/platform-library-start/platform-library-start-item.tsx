import type { Icon } from "@phosphor-icons/react";
import { Link } from "@/i18n/navigation";

// The icon box sits 12px inside the tile, so `rounded-sm` (9.6px) stays
// concentric with the tile's `rounded-xl` (22.4px).
const TILE =
  "group/start flex h-full w-full cursor-pointer items-start gap-3 rounded-xl bg-card p-3 text-left ring-1 ring-foreground/10 outline-none transition-[background-color,box-shadow] hover:bg-muted/50 hover:ring-foreground/20 focus-visible:ring-3 focus-visible:ring-ring/50";

interface StartTileProps {
  icon: Icon;
  label: string;
  hint: string;
}

function StartTileBody(props: StartTileProps) {
  const TileIcon = props.icon;

  return (
    <>
      <span className="grid size-9 shrink-0 place-items-center rounded-sm bg-muted text-muted-foreground transition-colors group-hover/start:bg-primary/10 group-hover/start:text-primary">
        <TileIcon className="size-4.5" />
      </span>
      <span className="flex min-w-0 flex-col gap-0.5 pt-px">
        <span className="text-sm font-medium">{props.label}</span>
        <span className="text-xs text-muted-foreground max-sm:hidden">
          {props.hint}
        </span>
      </span>
    </>
  );
}

/** A start tile that opens the create sheet. */
export function PlatformLibraryStartButton(
  props: StartTileProps & { onClick: () => void },
) {
  return (
    <button type="button" className={TILE} onClick={props.onClick}>
      <StartTileBody icon={props.icon} label={props.label} hint={props.hint} />
    </button>
  );
}

/** A start tile that moves to another page. */
export function PlatformLibraryStartLink(
  props: StartTileProps & { href: string },
) {
  return (
    <Link href={props.href} className={TILE}>
      <StartTileBody icon={props.icon} label={props.label} hint={props.hint} />
    </Link>
  );
}
