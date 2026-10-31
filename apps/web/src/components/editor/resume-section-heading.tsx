import { ResumeHeading } from "./resume-heading";

interface ResumeSectionHeadingProps {
  title: string;
}

export function ResumeSectionHeading(props: ResumeSectionHeadingProps) {
  return (
    <div className="flex flex-col gap-1">
      <ResumeHeading
        level={2}
        className="resume-title-sm font-semibold uppercase tracking-wide"
      >
        {props.title}
      </ResumeHeading>
      <span className="flex-1 border-t border-dotted border-muted-foreground/40" />
    </div>
  );
}
