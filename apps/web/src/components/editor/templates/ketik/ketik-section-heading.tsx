import { ResumeHeading } from "../../resume-heading";

interface KetikSectionHeadingProps {
  title: string;
}

export function KetikSectionHeading(props: KetikSectionHeadingProps) {
  return (
    <ResumeHeading
      level={2}
      className="border-b border-dashed border-muted-foreground/50 pb-1 font-mono resume-title-xs font-bold uppercase"
    >
      {props.title}
    </ResumeHeading>
  );
}
