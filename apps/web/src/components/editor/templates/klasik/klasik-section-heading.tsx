import { ResumeHeading } from "../../resume-heading";

interface KlasikSectionHeadingProps {
  title: string;
}

export function KlasikSectionHeading(props: KlasikSectionHeadingProps) {
  return (
    <div className="border-b border-muted-foreground/40 pb-1">
      <ResumeHeading
        level={2}
        className="text-center font-serif resume-title-sm uppercase"
      >
        {props.title}
      </ResumeHeading>
    </div>
  );
}
