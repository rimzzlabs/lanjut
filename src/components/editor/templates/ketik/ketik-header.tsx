import { Fragment } from "react";
import type { HeaderView } from "../../resume-preview";

export function KetikHeader(props: HeaderView) {
  return (
    <header className="font-mono">
      <h1 className="text-xl font-bold">{props.fullName}</h1>
      {props.headline && (
        <p className="mt-0.5 text-sm text-muted-foreground">{props.headline}</p>
      )}
      {props.contacts.length > 0 && (
        <p className="mt-1.5 text-xs text-muted-foreground">
          {props.contacts.map((contact, index) => (
            <Fragment key={contact.kind}>
              {index > 0 && <span aria-hidden> | </span>}
              {contact.href ? (
                <a href={contact.href} className="hover:underline">
                  {contact.value}
                </a>
              ) : (
                <span>{contact.value}</span>
              )}
            </Fragment>
          ))}
        </p>
      )}
    </header>
  );
}
