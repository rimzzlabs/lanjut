import { ResumeHeading } from "../../resume-heading";

interface PolosSectionHeadingProps {
  title: string;
}

export function PolosSectionHeading(props: PolosSectionHeadingProps) {
  return (
    <ResumeHeading
      level={2}
      className="border-b border-foreground pb-0.5 resume-title-sm font-bold uppercase"
    >
      {props.title}
    </ResumeHeading>
  );
}
