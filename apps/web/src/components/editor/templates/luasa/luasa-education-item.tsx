import { withLocation } from "../../resume-entry-location";
import { ResumeHeading } from "../../resume-heading";

import type { EducationItemView } from "../../resume-preview";
import { ResumeRichText } from "../../resume-rich-text";

export function LuasaEducationItem(props: EducationItemView) {
  return (
    <article className="border-l-2 border-foreground/30 pl-4">
      <div className="flex items-baseline justify-between gap-4">
        <ResumeHeading
          level={3}
          className="resume-body-xs uppercase tracking-wide"
        >
          {props.degree}
        </ResumeHeading>
        <span className="shrink-0 resume-body-xs text-muted-foreground">
          {props.startDate} – {props.endDate}
        </span>
      </div>
      <p className="resume-body-xs italic text-muted-foreground">
        {withLocation(props.institution, props.location)}
      </p>
      <ResumeRichText blocks={props.details} className="mt-1" />
    </article>
  );
}
