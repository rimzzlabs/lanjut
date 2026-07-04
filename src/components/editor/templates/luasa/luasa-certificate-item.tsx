import type { CertificateItemView } from "../../resume-preview";

export function LuasaCertificateItem(props: CertificateItemView) {
  return (
    <article className="border-l-2 border-foreground/30 pl-4">
      <div className="flex items-baseline justify-between gap-4">
        <h3 className="text-xs uppercase tracking-wide">
          {props.href ? (
            <a href={props.href} className="hover:underline">
              {props.title}
            </a>
          ) : (
            props.title
          )}
        </h3>
        {(props.startDate || props.endDate) && (
          <span className="shrink-0 text-xs text-muted-foreground">
            {props.startDate} – {props.endDate}
          </span>
        )}
      </div>
      <p className="text-xs italic text-muted-foreground">{props.issuer}</p>
    </article>
  );
}
