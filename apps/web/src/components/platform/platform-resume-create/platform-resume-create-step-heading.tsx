import type { Ref } from "react";

interface PlatformResumeCreateStepHeadingProps {
  title: string;
  hint?: string;
  /** The flow moves focus here when the step opens, so a screen reader announces it. */
  ref?: Ref<HTMLHeadingElement>;
}

/** The title, and an optional hint, at the top of a create step. */
export function PlatformResumeCreateStepHeading(
  props: PlatformResumeCreateStepHeadingProps,
) {
  return (
    <div className="flex flex-col gap-1">
      <h3
        ref={props.ref}
        tabIndex={-1}
        className="text-base font-medium outline-none"
      >
        {props.title}
      </h3>
      {props.hint && (
        <p className="text-sm text-muted-foreground">{props.hint}</p>
      )}
    </div>
  );
}
