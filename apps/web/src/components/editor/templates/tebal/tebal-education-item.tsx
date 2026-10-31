import { withLocation } from "../../resume-entry-location";
import { ResumeArticle, ResumeHeading } from "../../resume-heading";

import type { EducationItemView } from "../../resume-preview";
import { ResumeRichText } from "../../resume-rich-text";

export function TebalEducationItem(props: EducationItemView) {
  return (
    <ResumeArticle>
      <div className="flex items-baseline justify-between gap-4">
        <ResumeHeading level={3} className="resume-body-sm font-bold">
          {props.degree}
        </ResumeHeading>
        <span className="shrink-0 resume-body-xs font-semibold text-muted-foreground">
          {props.startDate} – {props.endDate}
        </span>
      </div>
      <p className="resume-body-xs font-medium text-muted-foreground">
        {withLocation(props.institution, props.location)}
      </p>
      <ResumeRichText blocks={props.details} className="mt-1" />
    </ResumeArticle>
  );
}
