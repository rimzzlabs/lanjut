import { A } from "@mobily/ts-belt";
import { ResumeHeaderPhoto } from "../../resume-header-photo";
import { ResumeHeading } from "../../resume-heading";
import { ResumeOptionalLink } from "../../resume-optional-link";
import type { HeaderView } from "../../resume-preview";

export function TengahHeader(props: HeaderView) {
  return (
    <header className="text-center">
      <ResumeHeaderPhoto header={props} className="mx-auto mb-2" />
      <ResumeHeading
        level={1}
        className="resume-name-2xl font-semibold tracking-tight"
      >
        {props.fullName}
      </ResumeHeading>
      {props.headline && (
        <p className="mt-0.5 resume-name-sm text-muted-foreground">
          {props.headline}
        </p>
      )}
      {A.isNotEmpty(props.contacts) && (
        <ul className="mt-1.5 resume-body-xs text-muted-foreground flex flex-wrap justify-center gap-x-3 gap-y-0.5">
          {props.contacts.map((contact) => (
            <li key={contact.kind}>
              <ResumeOptionalLink
                href={contact.href}
                className="underline"
                wrapPlain
              >
                {contact.value}
              </ResumeOptionalLink>
            </li>
          ))}
        </ul>
      )}
    </header>
  );
}
