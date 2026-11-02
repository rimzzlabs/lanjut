import { ResumeHeading } from "../../resume-heading";

interface TegasSectionHeadingProps {
  title: string;
}

export function TegasSectionHeading(props: TegasSectionHeadingProps) {
  return (
    <ResumeHeading
      level={2}
      className="resume-rule border-l-4 border-foreground pl-2 font-serif resume-title-sm font-bold"
    >
      {props.title}
    </ResumeHeading>
  );
}
