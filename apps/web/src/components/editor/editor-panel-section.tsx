import { type ReactNode, useId } from "react";

interface EditorPanelSectionProps {
  icon: ReactNode;
  title: string;
  description: string;
  /** A control for the whole section, such as a reset, beside the title. */
  action?: ReactNode;
  children: ReactNode;
}

/**
 * One group of a side-panel tab, named by what the person wants to do: an
 * icon and a title, a line on what the group is for, then its controls.
 */
export function EditorPanelSection(props: EditorPanelSectionProps) {
  const headingId = useId();

  return (
    <section aria-labelledby={headingId} className="flex flex-col gap-4 py-5">
      <div className="flex items-start gap-3">
        <span className="grid size-8 shrink-0 place-items-center rounded-md bg-muted text-muted-foreground [&_svg]:size-4">
          {props.icon}
        </span>
        <div className="min-w-0 flex-1">
          <h3 id={headingId} className="text-sm font-medium">
            {props.title}
          </h3>
          <p className="text-xs text-muted-foreground text-balance">
            {props.description}
          </p>
        </div>
        {props.action}
      </div>
      <div className="flex flex-col gap-3">{props.children}</div>
    </section>
  );
}
