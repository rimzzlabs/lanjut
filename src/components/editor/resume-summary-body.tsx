import { ResumeRichText } from "./resume-rich-text";
import type { RichBlock } from "./rich-content";

interface ResumeSummaryBodyProps {
  body: RichBlock[];
}

export function ResumeSummaryBody(props: ResumeSummaryBodyProps) {
  return <ResumeRichText blocks={props.body} />;
}
