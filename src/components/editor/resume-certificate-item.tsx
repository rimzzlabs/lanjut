import type { CertificateItemView } from "./resume-preview";

export function ResumeCertificateItem(props: CertificateItemView) {
  return (
    <article>
      <div className="group flex items-baseline justify-between gap-4">
        <h3 className="resume-body-xs font-semibold">
          {props.href ? (
            <a href={props.href} className="hover:underline">
              {props.title}
            </a>
          ) : (
            props.title
          )}
        </h3>
        {(props.startDate || props.endDate) && (
          <span className="shrink-0 resume-body-xs text-muted-foreground">
            {props.startDate} - {props.endDate}
          </span>
        )}
      </div>
      <p className="resume-body-xs text-muted-foreground">{props.issuer}</p>
    </article>
  );
}
