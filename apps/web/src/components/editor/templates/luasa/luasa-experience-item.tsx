import { locationSuffix } from "../../resume-entry-location";
import { ResumeHeading } from "../../resume-heading";

import { ResumeOptionalLink } from "../../resume-optional-link";
import type { ExperienceItemView } from "../../resume-preview";
import { ResumeRichText } from "../../resume-rich-text";

export function LuasaExperienceItem(props: ExperienceItemView) {
  return (
    <article>
      <div className="flex items-baseline justify-between gap-4">
        <ResumeHeading
          level={3}
          className="resume-body-xs uppercase tracking-wide"
        >
          <ResumeOptionalLink href={props.roleHref} className="underline">
            {props.role}
          </ResumeOptionalLink>
        </ResumeHeading>
        <span className="shrink-0 resume-body-xs text-muted-foreground">
          {props.startDate} – {props.endDate}
        </span>
      </div>
      <p className="resume-body-xs italic text-muted-foreground">
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

      <ResumeRichText
        blocks={props.description}
        className="mt-1 [&_ul]:list-[square]"
      />
    </article>
  );
}
