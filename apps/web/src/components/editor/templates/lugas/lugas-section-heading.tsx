import { ResumeHeading } from "../../resume-heading";

interface LugasSectionHeadingProps {
  title: string;
}

export function LugasSectionHeading(props: LugasSectionHeadingProps) {
  return (
    <ResumeHeading
      level={2}
      className="resume-rule border-t border-foreground pt-1 resume-title-sm font-bold"
    >
      {props.title}
    </ResumeHeading>
  );
}
