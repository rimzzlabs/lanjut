import type { EducationItemView } from "../../resume-preview";
import { ResumeRichText } from "../../resume-rich-text";

export function KetikEducationItem(props: EducationItemView) {
  return (
    <article>
      <div className="flex items-baseline justify-between gap-4">
        <h3 className="font-mono text-xs font-bold">{props.degree}</h3>
        <span className="shrink-0 font-mono text-[0.6875rem] text-muted-foreground">
          {props.startDate} – {props.endDate}
        </span>
      </div>
      <p className="text-xs text-muted-foreground">{props.institution}</p>
      <ResumeRichText blocks={props.details} className="mt-1" />
    </article>
  );
}
