import type { ExperienceItemView } from "../../resume-preview";
import { ResumeRichText } from "../../resume-rich-text";

export function TebalExperienceItem(props: ExperienceItemView) {
  return (
    <article>
      <div className="flex items-baseline justify-between gap-4">
        <h3 className="text-sm font-bold">{props.role}</h3>
        <span className="shrink-0 text-xs font-semibold text-muted-foreground">
          {props.startDate} – {props.endDate}
        </span>
      </div>
      <p className="text-xs font-medium text-muted-foreground">
        {props.companyHref ? (
          <a href={props.companyHref} className="hover:underline">
            {props.company}
          </a>
        ) : (
          props.company
        )}
      </p>

      <ResumeRichText blocks={props.description} className="mt-2" />
    </article>
  );
}
