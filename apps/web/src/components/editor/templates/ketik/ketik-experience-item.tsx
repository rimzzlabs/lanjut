import { locationSuffix } from "../../resume-entry-location";
import { ResumeArticle, ResumeHeading } from "../../resume-heading";

import { ResumeOptionalLink } from "../../resume-optional-link";
import type { ExperienceItemView } from "../../resume-preview";
import { ResumeRichText } from "../../resume-rich-text";

export function KetikExperienceItem(props: ExperienceItemView) {
  return (
    <ResumeArticle>
      <div className="flex items-baseline justify-between gap-4">
        <ResumeHeading level={3} className="font-mono resume-body-xs font-bold">
          <ResumeOptionalLink href={props.roleHref} className="underline">
            {props.role}
          </ResumeOptionalLink>
        </ResumeHeading>
        <span className="shrink-0 font-mono text-[0.6875rem] text-muted-foreground">
          {props.startDate} – {props.endDate}
        </span>
      </div>
      <p className="resume-body-xs text-muted-foreground">
        <ResumeOptionalLink href={props.companyHref} className="underline">
          {props.company}
        </ResumeOptionalLink>
        {locationSuffix(props.company, props.location)}
      </p>

      {Boolean(props.companyContext) && (
        <p className="resume-body-xs text-muted-foreground">
          {props.companyContext}
        </p>
      )}

      <ResumeRichText blocks={props.description} className="mt-1" />
    </ResumeArticle>
  );
}
