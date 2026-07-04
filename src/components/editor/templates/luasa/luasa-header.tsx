import { Fragment } from "react";
import type { HeaderView } from "../../resume-preview";

export function LuasaHeader(props: HeaderView) {
  return (
    <header className="border-l-2 border-foreground/80 pl-4">
      <h1 className="font-serif text-2xl uppercase tracking-[0.08em]">
        {props.fullName}
      </h1>
      {props.headline && (
        <p className="mt-0.5 font-serif text-sm text-muted-foreground">
          {props.headline}
        </p>
      )}
      {props.contacts.length > 0 && (
        <p className="mt-1 text-xs text-muted-foreground">
          {props.contacts.map((contact, index) => (
            <Fragment key={contact.kind}>
              {index > 0 && <span aria-hidden> • </span>}
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
