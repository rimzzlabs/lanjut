import { ResumeHeading } from "../../resume-heading";

interface AnggunSectionHeadingProps {
  title: string;
}

export function AnggunSectionHeading(props: AnggunSectionHeadingProps) {
  return (
    <div className="flex flex-col items-center gap-1">
      <ResumeHeading
        level={2}
        className="text-center font-serif resume-title-base italic [font-kerning:none]"
      >
        {props.title}
      </ResumeHeading>
      <span className="w-8 border-t border-muted-foreground/60" />
    </div>
  );
}
