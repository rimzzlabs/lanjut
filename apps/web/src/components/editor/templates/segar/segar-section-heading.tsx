import { ResumeHeading } from "../../resume-heading";

interface SegarSectionHeadingProps {
  title: string;
}

export function SegarSectionHeading(props: SegarSectionHeadingProps) {
  return (
    <div className="flex">
      <ResumeHeading
        level={2}
        className="border-b-2 border-foreground/80 pb-0.5 resume-title-sm font-bold"
      >
        {props.title}
      </ResumeHeading>
    </div>
  );
}
