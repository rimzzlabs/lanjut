import { ResumeHeading } from "../../resume-heading";

interface RingkasSectionHeadingProps {
  title: string;
}

export function RingkasSectionHeading(props: RingkasSectionHeadingProps) {
  return (
    <ResumeHeading
      level={2}
      className="resume-title-xs font-bold uppercase tracking-wide text-muted-foreground"
    >
      {props.title}
    </ResumeHeading>
  );
}
