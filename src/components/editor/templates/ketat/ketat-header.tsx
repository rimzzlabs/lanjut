import { Globe, Mail, MapPin, Phone } from "lucide-react";
import type {
  ContactKind,
  ContactView,
  HeaderView,
} from "../../resume-preview";

const CONTACT_ICON: Record<ContactKind, typeof Phone> = {
  phone: Phone,
  email: Mail,
  website: Globe,
  location: MapPin,
};

function KetatHeaderContact(props: ContactView) {
  const Icon = CONTACT_ICON[props.kind];
  return (
    <li className="flex items-center justify-end gap-2">
      {props.href ? (
        <a href={props.href} className="hover:underline">
          {props.value}
        </a>
      ) : (
        <span>{props.value}</span>
      )}
      <Icon className="size-3.5 shrink-0" aria-hidden />
    </li>
  );
}

export function KetatHeader(props: HeaderView) {
  return (
    <header className="flex flex-wrap items-start justify-between gap-6">
      <div className="min-w-0">
        <h1 className="font-serif text-2xl uppercase tracking-wide">
          {props.fullName}
        </h1>
        <p className="mt-1 font-serif text-base text-muted-foreground">
          {props.headline}
        </p>
      </div>

      <ul className="space-y-1.5 text-xs">
        {props.contacts.map((contact) => (
          <KetatHeaderContact key={contact.kind} {...contact} />
        ))}
      </ul>
    </header>
  );
}
