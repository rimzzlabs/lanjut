import { ResumeHeading } from "../../resume-heading";

interface TengahSectionHeadingProps {
  title: string;
}

export function TengahSectionHeading(props: TengahSectionHeadingProps) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex-1 border-t border-muted-foreground/40" />
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
