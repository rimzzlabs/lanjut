import { Fragment } from "react";
import { ResumeHeaderPhoto } from "../../resume-header-photo";
import type { HeaderView } from "../../resume-preview";

export function KetikHeader(props: HeaderView) {
  return (
    <header className="flex items-start gap-4 font-mono">
      <ResumeHeaderPhoto header={props} />
      <div>
        <h1 className="resume-name-xl font-bold">{props.fullName}</h1>
        {props.headline && (
          <p className="mt-0.5 resume-name-sm text-muted-foreground">
            {props.headline}
          </p>
        )}
        {props.contacts.length > 0 && (
          <p className="mt-1.5 resume-body-xs text-muted-foreground">
            {props.contacts.map((contact, index) => (
              <Fragment key={contact.kind}>
                {index > 0 && <span aria-hidden> | </span>}
                {contact.href ? (
                  <a href={contact.href} className="underline">
                    {contact.value}
                  </a>
                ) : (
                  <span>{contact.value}</span>
                )}
              </Fragment>
            ))}
          </p>
        )}
      </div>
    </header>
  );
}
