import type { ExperienceItemView } from "../../resume-preview";
import { ResumeRichText } from "../../resume-rich-text";

export function KetatExperienceItem(props: ExperienceItemView) {
  return (
    <article>
      <h3 className="text-xs font-semibold">{props.role}</h3>
      <div className="flex items-baseline justify-between gap-4">
        <p className="text-xs text-muted-foreground">
          {props.companyHref ? (
            <a href={props.companyHref} className="hover:underline">
              {props.company}
            </a>
          ) : (
            props.company
          )}
        </p>
        <span className="shrink-0 text-xs italic text-muted-foreground">
          {props.startDate} – {props.endDate}
        </span>
      </div>

      <ResumeRichText blocks={props.description} className="mt-2" />
    </article>
  );
}
