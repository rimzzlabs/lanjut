import { A } from "@mobily/ts-belt";
import { ResumeHeaderContact } from "../../resume-header-contact";
import { ResumeHeaderPhoto } from "../../resume-header-photo";
import { ResumeHeading } from "../../resume-heading";
import type { HeaderView } from "../../resume-preview";

export function ElokHeader(props: HeaderView) {
  return (
    <header className="flex items-start gap-4">
      <ResumeHeaderPhoto header={props} />
      <div>
        <ResumeHeading level={1} className="font-serif resume-name-3xl">
          {props.fullName}
        </ResumeHeading>
        {props.headline && (
          <p className="mt-1 font-serif resume-name-sm italic text-muted-foreground">
            {props.headline}
          </p>
        )}
        {A.isNotEmpty(props.contacts) && (
          <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 resume-body-xs">
            {props.contacts.map((contact) => (
              <ResumeHeaderContact
                key={contact.kind}
                showIcons={props.showIcons}
                {...contact}
              />
            ))}
          </ul>
        )}
      </div>
    </header>
  );
}
