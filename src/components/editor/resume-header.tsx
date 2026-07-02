import { ResumeHeaderContact } from "./resume-header-contact";
import type { HeaderView } from "./resume-preview";

export function ResumeHeader(props: HeaderView) {
  return (
    <header className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{props.fullName}</h1>
        <p className="mt-1 text-muted-foreground">{props.headline}</p>
      </div>

      <ul className="space-y-1 text-sm">
        {props.contacts.map((contact) => (
          <ResumeHeaderContact key={contact.kind} {...contact} />
        ))}
      </ul>
    </header>
  );
}
