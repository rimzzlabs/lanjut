"use client";

import { useTranslations } from "next-intl";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
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
} from "../resume-form-adapter";

interface EditorSectionCustomBodyFormProps {
  sectionId: string;
}

export function EditorSectionCustomBodyForm(
  props: EditorSectionCustomBodyFormProps,
) {
  const updateOpen = useResumeStore((state) => state.updateOpen);
  const t = useTranslations("editor.custom");

  // Read the section once at mount (via getState, not a subscription): the form
  // owns its state afterward and the store is synced through the watch below.
  const initial = useResumeStore
    .getState()
    .open?.sections.find((s) => s.id === props.sectionId);
  const form = useForm<CustomBodyFormValues>({
    defaultValues:
      initial?.type === "custom"
        ? toCustomBodyValues(initial)
        : { body: emptyRichTextValue() },
  });

  useEffect(() => {
    const subscription = form.watch(() => {
      updateOpen((draft) =>
        applyCustomBodyValues(draft, props.sectionId, form.getValues()),
      );
    });
    return () => subscription.unsubscribe();
  }, [form, updateOpen, props.sectionId]);

  return (
    <form>
      <FieldGroup>
        <Controller
          control={form.control}
          name="body"
          render={({ field, fieldState }) => (
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
          )}
        />
      </FieldGroup>
    </form>
  );
}
