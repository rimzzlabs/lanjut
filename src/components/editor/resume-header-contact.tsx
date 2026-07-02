import { Globe, Mail, MapPin, Phone } from "lucide-react";
import type { ContactKind, ContactView } from "./resume-preview";

const CONTACT_ICON: Record<ContactKind, typeof Phone> = {
  phone: Phone,
  email: Mail,
  website: Globe,
  location: MapPin,
};

export function ResumeHeaderContact(props: ContactView) {
  const Icon = CONTACT_ICON[props.kind];
  return (
    <li className="flex items-center gap-2">
      <Icon className="size-3.5 shrink-0 text-muted-foreground" aria-hidden />
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
