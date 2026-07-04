import { ResumeHeaderContact } from "../../resume-header-contact";
import type { HeaderView } from "../../resume-preview";

export function TebalHeader(props: HeaderView) {
  return (
    <header>
      <h1 className="text-3xl font-extrabold tracking-tight">
        {props.fullName}
      </h1>
      {props.headline && (
        <p className="mt-1 text-sm font-medium text-muted-foreground">
          {props.headline}
        </p>
      )}
      {props.contacts.length > 0 && (
        <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs">
          {props.contacts.map((contact) => (
            <ResumeHeaderContact key={contact.kind} {...contact} />
          ))}
        </ul>
      )}
    </header>
  );
}
