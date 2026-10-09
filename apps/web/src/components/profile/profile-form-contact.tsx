import { Field, FieldError, FieldLabel } from "@lanjut/ui/components/field";
import { type Control, Controller } from "react-hook-form";
import { useTranslations } from "use-intl";
import { LinkedinInput } from "@/components/shared/linkedin-input";
import { PhoneNumberInput } from "@/components/shared/phone-number-input";
import { UrlInput } from "@/components/shared/url-input";
import type { ProfileForm } from "@/lib/forms/profile";

type ContactKey = "phone" | "website" | "linkedin" | "link";

const CONTACT_INPUTS = {
  phone: PhoneNumberInput,
  website: UrlInput,
  linkedin: LinkedinInput,
  link: UrlInput,
} as const;

/**
 * A contact field with its formatted input, the same inputs the editor's
 * Personal Information form uses.
 */
export function ProfileFormContact(props: {
  control: Control<ProfileForm>;
  name: ContactKey;
}) {
  const t = useTranslations("editor.personal");
  const ContactInput = CONTACT_INPUTS[props.name];

  return (
    <Controller
      control={props.control}
      name={props.name}
      render={(controller) => {
        const { field, fieldState } = controller;
        return (
          <Field>
            <FieldLabel htmlFor={field.name}>{t(props.name)}</FieldLabel>
            <ContactInput
              id={field.name}
              value={field.value}
              placeholder={t(`${props.name}Placeholder`)}
              onChange={field.onChange}
              onBlur={field.onBlur}
            />
            <FieldError errors={[fieldState.error]} />
          </Field>
        );
      }}
    />
  );
}
