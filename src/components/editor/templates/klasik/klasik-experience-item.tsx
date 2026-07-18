import type { ExperienceItemView } from "../../resume-preview";
import { ResumeRichText } from "../../resume-rich-text";

export function KlasikExperienceItem(props: ExperienceItemView) {
  return (
    <article className="font-serif">
      <div className="flex items-baseline justify-between gap-4">
        <h3 className="resume-body-sm font-semibold">
          {props.roleHref ? (
            <a href={props.roleHref} className="hover:underline">
              {props.role}
            </a>
          ) : (
            props.role
          )}
        </h3>
        <span className="shrink-0 resume-body-xs italic text-muted-foreground">
          {props.startDate} – {props.endDate}
        </span>
      </div>
      <p className="resume-body-xs text-muted-foreground">
        {props.companyHref ? (
          <a href={props.companyHref} className="hover:underline">
            {props.company}
          </a>
        ) : (
          props.company
        )}
      </p>

      <ResumeRichText blocks={props.description} className="mt-2 font-serif" />
    </article>
  );
}
