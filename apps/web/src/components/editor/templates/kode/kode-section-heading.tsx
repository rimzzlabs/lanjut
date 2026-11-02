import { ResumeHeading } from "../../resume-heading";

interface KodeSectionHeadingProps {
  title: string;
}

export function KodeSectionHeading(props: KodeSectionHeadingProps) {
  return (
    <ResumeHeading
      level={2}
      className="resume-rule border-b border-dotted border-muted-foreground/60 pb-1 font-mono resume-title-xs font-bold uppercase"
    >
      {props.title}
    </ResumeHeading>
  );
}
