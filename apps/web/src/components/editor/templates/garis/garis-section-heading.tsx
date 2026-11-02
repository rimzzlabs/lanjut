import { ResumeHeading } from "../../resume-heading";

interface GarisSectionHeadingProps {
  title: string;
}

export function GarisSectionHeading(props: GarisSectionHeadingProps) {
  return (
    <div className="flex items-center gap-3">
      <ResumeHeading
        level={2}
        className="shrink-0 resume-title-xs font-semibold uppercase tracking-[0.14em]"
      >
        {props.title}
      </ResumeHeading>
      <span className="flex-1 border-t border-muted-foreground/40" />
    </div>
  );
}
