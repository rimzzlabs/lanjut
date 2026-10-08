import { ResumeContactIcon } from "./resume-contact-icon";
import { ResumeOptionalLink } from "./resume-optional-link";
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
      <ResumeOptionalLink href={props.href} className="underline" wrapPlain>
        {props.value}
      </ResumeOptionalLink>
    </li>
  );
}
