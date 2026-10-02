import { locationSuffix } from "../../resume-entry-location";
import { ResumeOptionalLink } from "../../resume-optional-link";
import type { ExperienceItemView } from "../../resume-preview";
import { ResumeRichText } from "../../resume-rich-text";

export function KetatExperienceItem(props: ExperienceItemView) {
  return (
    <article>
      <h3 className="resume-body-xs font-semibold">
        <ResumeOptionalLink href={props.roleHref} className="underline">
          {props.role}
        </ResumeOptionalLink>
      </h3>
      <div className="flex items-baseline justify-between gap-4">
        <p className="resume-body-xs text-muted-foreground">
          <ResumeOptionalLink href={props.companyHref} className="underline">
            {props.company}
          </ResumeOptionalLink>
          {locationSuffix(props.company, props.location)}
        </p>
        <span className="shrink-0 resume-body-xs italic text-muted-foreground">
          {props.startDate} – {props.endDate}
        </span>
      </div>

      {Boolean(props.companyContext) && (
        <p className="resume-body-xs text-muted-foreground">
          {props.companyContext}
        </p>
      )}

      <ResumeRichText blocks={props.description} className="mt-2" />
    </article>
  );
}
