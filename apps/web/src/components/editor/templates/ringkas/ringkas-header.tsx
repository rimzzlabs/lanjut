import { A } from "@mobily/ts-belt";
import { Fragment } from "react";
import { ResumeHeaderPhoto } from "../../resume-header-photo";
import { ResumeHeading } from "../../resume-heading";
import { ResumeOptionalLink } from "../../resume-optional-link";
import type { HeaderView } from "../../resume-preview";

export function RingkasHeader(props: HeaderView) {
  return (
    <header className="flex items-start gap-4">
      <ResumeHeaderPhoto header={props} />
      <div>
        <ResumeHeading level={1} className="resume-name-xl font-bold">
          {props.fullName}
        </ResumeHeading>
        {props.headline && (
          <p className="resume-name-sm text-muted-foreground">
            {props.headline}
          </p>
        )}
        {A.isNotEmpty(props.contacts) && (
          <p className="mt-0.5 resume-body-xs text-muted-foreground">
            {props.contacts.map((contact, index) => (
              <Fragment key={contact.kind}>
                {index > 0 && <span aria-hidden> · </span>}
                <span className="whitespace-nowrap">
                  <ResumeOptionalLink href={contact.href} className="underline">
                    {contact.value}
                  </ResumeOptionalLink>
                </span>
              </Fragment>
            ))}
          </p>
        )}
      </div>
    </header>
  );
}
