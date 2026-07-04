import type { CertificateItemView } from "../../resume-preview";

export function KetikCertificateItem(props: CertificateItemView) {
  return (
    <article>
      <div className="flex items-baseline justify-between gap-4">
        <h3 className="font-mono text-xs font-bold">
          {props.href ? (
            <a href={props.href} className="hover:underline">
              {props.title}
            </a>
          ) : (
            props.title
          )}
        </h3>
        {(props.startDate || props.endDate) && (
          <span className="shrink-0 font-mono text-[0.6875rem] text-muted-foreground">
            {props.startDate} – {props.endDate}
          </span>
        )}
      </div>
      <p className="text-xs text-muted-foreground">{props.issuer}</p>
    </article>
  );
}
