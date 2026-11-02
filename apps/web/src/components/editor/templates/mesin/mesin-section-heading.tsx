import { ResumeHeading } from "../../resume-heading";

interface MesinSectionHeadingProps {
  title: string;
}

export function MesinSectionHeading(props: MesinSectionHeadingProps) {
  return (
    <ResumeHeading
      level={2}
      className="font-mono resume-title-sm font-bold uppercase underline"
    >
      {props.title}
    </ResumeHeading>
  );
}
