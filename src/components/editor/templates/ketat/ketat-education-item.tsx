import type { EducationItemView } from "../../resume-preview";
import { ResumeRichText } from "../../resume-rich-text";

export function KetatEducationItem(props: EducationItemView) {
  return (
    <article>
      <h3 className="text-xs font-semibold">{props.degree}</h3>
      <div className="flex items-baseline justify-between gap-4">
        <p className="text-xs text-muted-foreground">{props.institution}</p>
        <span className="shrink-0 text-xs italic text-muted-foreground">
          {props.startDate} – {props.endDate}
        </span>
      </div>
      <ResumeRichText blocks={props.details} className="mt-1" />
    </article>
  );
}
