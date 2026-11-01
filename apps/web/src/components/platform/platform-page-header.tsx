import type { ReactNode } from "react";

/** The title of a platform page over a hairline rule, with its actions beside it. */
export function PlatformPageHeader(props: {
  title: string;
  description?: string;
  /** A link that follows the description, such as a guide. */
  descriptionLink?: { href: string; label: string };
  children?: ReactNode;
}) {
  return (
    <header className="flex flex-col gap-4 border-b pb-6 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">{props.title}</h1>
        {props.description && (
          <p className="max-w-prose text-sm text-muted-foreground">
            {props.description}
            {props.descriptionLink && (
              <>
                {" "}
                <a
                  href={props.descriptionLink.href}
                  className="rounded-xs text-foreground underline underline-offset-4 hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                >
                  {props.descriptionLink.label}
                </a>
              </>
            )}
          </p>
        )}
      </div>
      {props.children}
    </header>
  );
}
