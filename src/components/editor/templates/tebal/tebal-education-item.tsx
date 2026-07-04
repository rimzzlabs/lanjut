import type { EducationItemView } from "../../resume-preview";
import { ResumeRichText } from "../../resume-rich-text";

export function TebalEducationItem(props: EducationItemView) {
  return (
    <article>
      <div className="flex items-baseline justify-between gap-4">
        <h3 className="text-sm font-bold">{props.degree}</h3>
        <span className="shrink-0 text-xs font-semibold text-muted-foreground">
          {props.startDate} – {props.endDate}
        </span>
      </div>
      <p className="text-xs font-medium text-muted-foreground">
        {props.institution}
      </p>
      <ResumeRichText blocks={props.details} className="mt-1" />
    </article>
  );
}
