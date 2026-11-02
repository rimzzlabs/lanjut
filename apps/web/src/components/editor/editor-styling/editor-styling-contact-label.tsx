import {
  CONTACT_LABEL_MAX,
  type ContactLabelKind,
} from "@lanjut/resume/contact-labels";
import { Field, FieldLabel } from "@lanjut/ui/components/field";
import { Input } from "@lanjut/ui/components/input";
import { useId } from "react";
import { useTranslations } from "use-intl";
import { useResumeStore } from "@/lib/store";
import { withContactLabel } from "./styling-values";

const LABEL_KEYS: Record<ContactLabelKind, string> = {
  email: "labelEmail",
  website: "labelWebsite",
  linkedin: "labelLinkedin",
  link: "labelLink",
};

interface EditorStylingContactLabelProps {
  kind: ContactLabelKind;
  address: string;
  label: string;
}

/** The text one contact shows in place of its address; empty shows the address. */
export function EditorStylingContactLabel(
  props: EditorStylingContactLabelProps,
) {
  const updateOpen = useResumeStore((state) => state.updateOpen);
  const t = useTranslations("editor.styling");
  const id = useId();

  return (
    <Field>
      <FieldLabel htmlFor={id} className="font-normal text-muted-foreground">
        {t(LABEL_KEYS[props.kind])}
      </FieldLabel>
      <Input
        id={id}
        placeholder={props.address}
        maxLength={CONTACT_LABEL_MAX}
        autoComplete="off"
        value={props.label}
        onChange={(event) => {
          const label = event.target.value;
          updateOpen((resume) => withContactLabel(resume, props.kind, label));
        }}
      />
    </Field>
  );
}
