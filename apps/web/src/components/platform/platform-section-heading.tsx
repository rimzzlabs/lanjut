import type { ReactNode } from "react";

/** The heading of one section of a library or template page. */
export function PlatformSectionHeading(props: {
  id: string;
  children: ReactNode;
}) {
  return (
    <h2
      id={props.id}
      className="flex items-center gap-2 text-sm font-semibold tracking-tight"
    >
      {props.children}
    </h2>
  );
}
