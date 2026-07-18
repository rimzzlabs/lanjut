import { ResumeHeaderContact } from "./resume-header-contact";
import type { HeaderView } from "./resume-preview";

export function ResumeHeader(props: HeaderView) {
  return (
    <header className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="resume-name-xl font-bold tracking-tight">
          {props.fullName}
        </h1>
        <p className="mt-1 text-muted-foreground resume-name-sm">
          {props.headline}
        </p>
      </div>

      <ul className="space-y-1 resume-body-xs">
        {props.contacts.map((contact) => (
          <ResumeHeaderContact
            key={contact.kind}
            showIcons={props.showIcons}
            {...contact}
          />
        ))}
      </ul>
    </header>
  );
}
