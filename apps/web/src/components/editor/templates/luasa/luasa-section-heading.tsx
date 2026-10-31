import { ResumeHeading } from "../../resume-heading";

interface LuasaSectionHeadingProps {
  title: string;
}

export function LuasaSectionHeading(props: LuasaSectionHeadingProps) {
  return (
    <ResumeHeading
      level={2}
      className="font-serif resume-title-xs font-semibold uppercase tracking-[0.2em]"
    >
      {props.title}
    </ResumeHeading>
  );
}
