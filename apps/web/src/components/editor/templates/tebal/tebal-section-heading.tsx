import { ResumeHeading } from "../../resume-heading";

interface TebalSectionHeadingProps {
  title: string;
}

export function TebalSectionHeading(props: TebalSectionHeadingProps) {
  return (
    <div className="border-t-4 border-foreground pt-1">
      <ResumeHeading
        level={2}
        className="resume-title-sm font-extrabold uppercase tracking-wide"
      >
        {props.title}
      </ResumeHeading>
    </div>
  );
}
