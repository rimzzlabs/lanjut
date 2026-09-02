import { locationSuffix } from "./resume-entry-location";
import type { ExperienceItemView } from "./resume-preview";
import { ResumeRichText } from "./resume-rich-text";

export function ResumeExperienceItem(props: ExperienceItemView) {
  return (
    <article>
      <div className="flex items-baseline justify-between gap-4">
        <h3 className="resume-body-xs font-semibold">{props.role}</h3>
        <span className="shrink-0 resume-body-xs text-muted-foreground">
          {props.startDate} - {props.endDate}
        </span>
      </div>

      <p className="resume-body-xs text-muted-foreground">
        {props.companyHref ? (
          <a href={props.companyHref} className="underline">
            {props.company}
          </a>
        ) : (
          props.company
        )}
        {locationSuffix(props.company, props.location)}
      </p>

      <ResumeRichText blocks={props.description} className="mt-2" />
    </article>
  );
}
