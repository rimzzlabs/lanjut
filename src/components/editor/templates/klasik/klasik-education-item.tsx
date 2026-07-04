import type { EducationItemView } from "../../resume-preview";
import { ResumeRichText } from "../../resume-rich-text";

export function KlasikEducationItem(props: EducationItemView) {
  return (
    <article className="font-serif">
      <div className="flex items-baseline justify-between gap-4">
        <h3 className="text-sm font-semibold">{props.degree}</h3>
        <span className="shrink-0 text-xs italic text-muted-foreground">
          {props.startDate} – {props.endDate}
        </span>
      </div>
      <p className="text-xs text-muted-foreground">{props.institution}</p>
      <ResumeRichText blocks={props.details} className="mt-1 font-serif" />
    </article>
  );
}
