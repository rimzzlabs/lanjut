import type { CertificateItemView } from "./resume-preview";

export function ResumeCertificateItem(props: CertificateItemView) {
  return (
    <article>
      <div className="flex items-baseline justify-between gap-4">
        <h3 className="text-sm font-semibold">
          {props.href ? (
            <a href={props.href} className="hover:underline">
              {props.title}
            </a>
          ) : (
            props.title
          )}
        </h3>
        <span className="shrink-0 text-xs text-muted-foreground">
          {props.startDate} - {props.endDate}
        </span>
      </div>
      <p className="text-sm text-muted-foreground">{props.issuer}</p>
    </article>
  );
}
