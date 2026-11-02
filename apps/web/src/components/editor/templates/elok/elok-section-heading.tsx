import { ResumeHeading } from "../../resume-heading";

interface ElokSectionHeadingProps {
  title: string;
}

export function ElokSectionHeading(props: ElokSectionHeadingProps) {
  return (
    <ResumeHeading
      level={2}
      className="resume-rule border-t border-muted-foreground/40 pt-1.5 resume-title-xs font-semibold uppercase tracking-[0.12em]"
    >
      {props.title}
    </ResumeHeading>
  );
}
