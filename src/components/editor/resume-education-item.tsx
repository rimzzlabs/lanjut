import type { EducationItemView } from "./resume-preview";

export function ResumeEducationItem(props: EducationItemView) {
  return (
    <article>
      <div className="flex items-baseline justify-between gap-4 pb-1">
        <h3 className="text-xs font-semibold">{props.degree}</h3>
        <span className="shrink-0 text-xs text-muted-foreground">
          {props.startDate} - {props.endDate}
        </span>
      </div>
      <p className="text-xs text-muted-foreground">{props.institution}</p>
    </article>
  );
}
