import { ResumeRichText } from "../../resume-rich-text";
import type { RichBlock } from "../../rich-content";

interface LuasaSummaryBodyProps {
  body: RichBlock[];
}

export function LuasaSummaryBody(props: LuasaSummaryBodyProps) {
  return (
    <div className="border-l-2 border-foreground/30 pl-4">
      <ResumeRichText blocks={props.body} />
    </div>
  );
}
