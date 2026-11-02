import { ResumeHeading } from "../../resume-heading";

interface KertasSectionHeadingProps {
  title: string;
}

export function KertasSectionHeading(props: KertasSectionHeadingProps) {
  return (
    <ResumeHeading
      level={2}
      className="border-b border-foreground pb-0.5 font-serif resume-title-sm font-bold uppercase"
    >
      {props.title}
    </ResumeHeading>
  );
}
