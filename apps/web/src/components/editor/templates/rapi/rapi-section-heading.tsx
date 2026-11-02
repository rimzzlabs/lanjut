import { ResumeHeading } from "../../resume-heading";

interface RapiSectionHeadingProps {
  title: string;
}

export function RapiSectionHeading(props: RapiSectionHeadingProps) {
  return (
    <ResumeHeading
      level={2}
      className="border-b border-muted-foreground/50 pb-0.5 resume-title-sm font-bold uppercase"
    >
      {props.title}
    </ResumeHeading>
  );
}
