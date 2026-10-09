import { A } from "@mobily/ts-belt";
import { Fragment } from "react";
import { ResumeHeaderPhoto } from "../../resume-header-photo";
import { ResumeOptionalLink } from "../../resume-optional-link";
import type { HeaderView } from "../../resume-preview";

export function KlasikHeader(props: HeaderView) {
  return (
    <header className="text-center font-serif">
      <ResumeHeaderPhoto header={props} className="mx-auto mb-2" />
      <h1 className="resume-name-2xl">{props.fullName}</h1>
      {props.headline && (
        <p className="mt-0.5 resume-name-sm italic text-muted-foreground">
          {props.headline}
        </p>
      )}
      {A.isNotEmpty(props.contacts) && (
        <p className="mt-1.5 resume-body-xs text-muted-foreground">
          {props.contacts.map((contact, index) => (
            <Fragment key={contact.kind}>
              {index > 0 && <span aria-hidden> · </span>}
              <ResumeOptionalLink
                href={contact.href}
                className="underline"
                wrapPlain
              >
                {contact.value}
              </ResumeOptionalLink>
            </Fragment>
          ))}
        </p>
      )}
    </header>
  );
}
