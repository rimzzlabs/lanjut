import { ResumeOptionalLink } from "../../resume-optional-link";
import type { CertificateItemView } from "../../resume-preview";

export function LuasaCertificateItem(props: CertificateItemView) {
  return (
    <article className="border-l-2 border-foreground/30 pl-4">
      <div className="flex items-baseline justify-between gap-4">
        <h3 className="resume-body-xs uppercase tracking-wide">
          <ResumeOptionalLink href={props.href} className="underline">
            {props.title}
          </ResumeOptionalLink>
        </h3>
        {(props.startDate || props.endDate) && (
          <span className="shrink-0 resume-body-xs text-muted-foreground">
            {props.startDate} – {props.endDate}
          </span>
        )}
      </div>
      <p className="resume-body-xs italic text-muted-foreground">
        {props.issuer}
      </p>
    </article>
  );
}
