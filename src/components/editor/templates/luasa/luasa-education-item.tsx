import type { EducationItemView } from "../../resume-preview";
import { ResumeRichText } from "../../resume-rich-text";

export function LuasaEducationItem(props: EducationItemView) {
  return (
    <article className="border-l-2 border-foreground/30 pl-4">
      <div className="flex items-baseline justify-between gap-4">
        <h3 className="text-xs uppercase tracking-wide">{props.degree}</h3>
        <span className="shrink-0 text-xs text-muted-foreground">
          {props.startDate} – {props.endDate}
        </span>
      </div>
      <p className="text-xs italic text-muted-foreground">
        {props.institution}
      </p>
      <ResumeRichText blocks={props.details} className="mt-1" />
    </article>
  );
}
