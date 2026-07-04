import type { CertificateItemView } from "../../resume-preview";

export function TebalCertificateItem(props: CertificateItemView) {
  return (
    <article>
      <div className="flex items-baseline justify-between gap-4">
        <h3 className="text-sm font-bold">
          {props.href ? (
            <a href={props.href} className="hover:underline">
              {props.title}
            </a>
          ) : (
            props.title
          )}
        </h3>
        {(props.startDate || props.endDate) && (
          <span className="shrink-0 text-xs font-semibold text-muted-foreground">
            {props.startDate} – {props.endDate}
          </span>
        )}
      </div>
      <p className="text-xs font-medium text-muted-foreground">
        {props.issuer}
      </p>
    </article>
  );
}
