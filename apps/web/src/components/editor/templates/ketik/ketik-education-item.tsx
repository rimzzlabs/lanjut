import { withLocation } from "../../resume-entry-location";
import { ResumeArticle, ResumeHeading } from "../../resume-heading";

import type { EducationItemView } from "../../resume-preview";
import { ResumeRichText } from "../../resume-rich-text";

export function KetikEducationItem(props: EducationItemView) {
  return (
    <ResumeArticle>
      <div className="flex items-baseline justify-between gap-4">
        <ResumeHeading level={3} className="font-mono resume-body-xs font-bold">
          {props.degree}
        </ResumeHeading>
        <span className="shrink-0 font-mono text-[0.6875rem] text-muted-foreground">
          {props.startDate} – {props.endDate}
        </span>
      </div>
      <p className="resume-body-xs text-muted-foreground">
        {withLocation(props.institution, props.location)}
      </p>
      <ResumeRichText blocks={props.details} className="mt-1" />
    </ResumeArticle>
  );
}
