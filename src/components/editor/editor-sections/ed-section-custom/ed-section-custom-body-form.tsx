import { A, O } from "@mobily/ts-belt";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { useTranslations } from "use-intl";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { emptyRichTextValue } from "@/lib/resume";
import { PROSE_FEATURES } from "@/lib/resume/schema-registry";
import { useResumeStore } from "@/lib/store";
import { RichTextEditor } from "../../rich-text/rich-text-editor";
import {
  applyCustomBodyValues,
  type CustomBodyFormValues,
  toCustomBodyValues,
} from "../resume-form-adapter-custom";

// Read the section once at mount (via getState, not a subscription): the form
// owns its state afterward and the store is synced through the watch below.
function initialValues(sectionId: string): CustomBodyFormValues {
  const section = A.find(
    useResumeStore.getState().open?.sections ?? [],
    (s) => s.id === sectionId,
  );
  if (O.isNone(section) || section.type !== "custom")
    return { body: emptyRichTextValue() };
  return toCustomBodyValues(section);
}

interface EditorSectionCustomBodyFormProps {
  sectionId: string;
}

export function EditorSectionCustomBodyForm(
  props: EditorSectionCustomBodyFormProps,
) {
  const updateOpen = useResumeStore((state) => state.updateOpen);
  const t = useTranslations("editor.custom");

  const form = useForm<CustomBodyFormValues>({
    defaultValues: initialValues(props.sectionId),
  });

  useEffect(() => {
    const subscription = form.watch(() => {
      updateOpen(applyCustomBodyValues(props.sectionId, form.getValues()));
    });
    return () => subscription.unsubscribe();
  }, [form, updateOpen, props.sectionId]);

  return (
    <form>
      <FieldGroup>
        <Controller
          control={form.control}
          name="body"
          render={(controller) => {
            const { field, fieldState } = controller;
            return (
              <Field>
                <FieldLabel htmlFor={field.name}>{t("bodyLabel")}</FieldLabel>
                <RichTextEditor
                  id={field.name}
                  value={field.value}
                  features={PROSE_FEATURES}
                  placeholder={t("bodyPlaceholder")}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                />
                <FieldError errors={[fieldState.error]} />
              </Field>
            );
          }}
        />
      </FieldGroup>
    </form>
  );
}
