import { ResumeHeading } from "../../resume-heading";

interface KetatSectionHeadingProps {
  title: string;
}

export function KetatSectionHeading(props: KetatSectionHeadingProps) {
  return (
    <div className="border-y border-muted-foreground/40 py-1.5">
      <ResumeHeading
        level={2}
        className="text-center font-serif resume-title-base tracking-wide"
      >
        {props.title}
      </ResumeHeading>
    </div>
  );
}
