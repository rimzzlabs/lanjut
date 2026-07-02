import type { ExperienceItemView } from "./resume-preview";

export function ResumeExperienceItem(props: ExperienceItemView) {
  return (
    <article>
      <div className="flex items-baseline justify-between gap-4">
        <h3 className="text-sm font-semibold">{props.role}</h3>
        <span className="shrink-0 text-xs text-muted-foreground">
          {props.startDate} - {props.endDate}
        </span>
      </div>

      <p className="text-sm text-muted-foreground">
        {props.companyHref ? (
          <a href={props.companyHref} className="hover:underline">
            {props.company}
          </a>
        ) : (
          props.company
        )}
      </p>

      <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-relaxed text-muted-foreground">
        {props.highlights.map((highlight) => (
          <li key={highlight}>{highlight}</li>
        ))}
      </ul>
    </article>
  );
}
