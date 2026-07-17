import { ResumeContactIcon } from "./resume-contact-icon";
import type { ContactView } from "./resume-preview";

export function ResumeHeaderContact(
  props: ContactView & { showIcons: boolean },
) {
  return (
    <li className="flex items-center gap-2">
      <ResumeContactIcon
        kind={props.kind}
        show={props.showIcons}
        className="text-muted-foreground"
      />
      {props.href ? (
        <a href={props.href} className="hover:underline">
          {props.value}
        </a>
      ) : (
        <span>{props.value}</span>
      )}
    </li>
  );
}
