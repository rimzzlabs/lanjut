import { ResumeHeading } from "../../resume-heading";

interface JurnalSectionHeadingProps {
  title: string;
}

export function JurnalSectionHeading(props: JurnalSectionHeadingProps) {
  return (
    <ResumeHeading
      level={2}
      className="resume-rule border-b-2 border-foreground pb-0.5 font-serif resume-title-base font-semibold"
    >
      {props.title}
    </ResumeHeading>
  );
}
