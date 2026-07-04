import { Fragment } from "react";
import type { HeaderView } from "../../resume-preview";

export function KlasikHeader(props: HeaderView) {
  return (
    <header className="text-center font-serif">
      <h1 className="text-2xl">{props.fullName}</h1>
      {props.headline && (
        <p className="mt-0.5 text-sm italic text-muted-foreground">
          {props.headline}
        </p>
      )}
      {props.contacts.length > 0 && (
        <p className="mt-1.5 text-xs text-muted-foreground">
          {props.contacts.map((contact, index) => (
            <Fragment key={contact.kind}>
              {index > 0 && <span aria-hidden> · </span>}
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
