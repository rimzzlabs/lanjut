import type { RichBlock } from "@/lib/resume/rich-content";
import { ResumeRichText } from "./resume-rich-text";

interface ResumeSummaryBodyProps {
  body: RichBlock[];
}

export function ResumeSummaryBody(props: ResumeSummaryBodyProps) {
  return <ResumeRichText blocks={props.body} />;
}
