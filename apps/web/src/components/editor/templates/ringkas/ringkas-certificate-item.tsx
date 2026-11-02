import { ResumeArticle, ResumeHeading } from "../../resume-heading";
import { ResumeOptionalLink } from "../../resume-optional-link";
import type { CertificateItemView } from "../../resume-preview";

export function RingkasCertificateItem(props: CertificateItemView) {
  return (
    <ResumeArticle>
      <div className="flex items-baseline justify-between gap-4">
        <ResumeHeading level={3} className="resume-body-sm font-semibold">
          <ResumeOptionalLink href={props.href} className="underline">
            {props.title}
          </ResumeOptionalLink>
        </ResumeHeading>
        {(props.startDate || props.endDate) && (
          <span className="shrink-0 resume-body-xs text-muted-foreground">
            {props.startDate} – {props.endDate}
          </span>
        )}
      </div>
      <p className="resume-body-xs text-muted-foreground">{props.issuer}</p>
    </ResumeArticle>
  );
}
