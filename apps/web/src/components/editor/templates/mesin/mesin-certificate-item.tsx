import { ResumeArticle, ResumeHeading } from "../../resume-heading";
import { ResumeOptionalLink } from "../../resume-optional-link";
import type { CertificateItemView } from "../../resume-preview";

export function MesinCertificateItem(props: CertificateItemView) {
  return (
    <ResumeArticle className="font-serif">
      <div className="flex items-baseline justify-between gap-4">
        <ResumeHeading level={3} className="font-mono resume-body-sm font-bold">
          <ResumeOptionalLink href={props.href} className="underline">
            {props.title}
          </ResumeOptionalLink>
        </ResumeHeading>
        {(props.startDate || props.endDate) && (
          <span className="shrink-0 font-mono resume-body-xs">
            {props.startDate} – {props.endDate}
          </span>
        )}
      </div>
      <p className="resume-body-xs">{props.issuer}</p>
    </ResumeArticle>
  );
}
