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
import { PROSE_FEATURES } from "@/lib/resume/schema-registry";
import { useResumeStore } from "@/lib/store";
import { RichTextEditor } from "../../rich-text/rich-text-editor";
import {
  applySummaryValues,
  type SummaryFormValues,
  toSummaryValues,
} from "../resume-form-adapter";

export function EditorSectionSummaryForm() {
  const open = useResumeStore((state) => state.open);
  const updateOpen = useResumeStore((state) => state.updateOpen);
  const t = useTranslations("editor.summary");
  const form = useForm<SummaryFormValues>({
    defaultValues: open ? toSummaryValues(open) : undefined,
  });

  // Mirror every edit into the store as it happens (debounced persist is the
  // store's job); reading inside the subscription avoids stale form snapshots.
  useEffect(() => {
    const subscription = form.watch(() => {
      updateOpen((draft) => applySummaryValues(draft, form.getValues()));
    });
    return () => subscription.unsubscribe();
  }, [form, updateOpen]);

  if (!open) return null;

  return (
    <form>
      <FieldGroup>
        <Controller
          control={form.control}
          name="summary"
          render={({ field, fieldState }) => (
            <Field>
              <FieldLabel htmlFor={field.name}>{t("label")}</FieldLabel>
              <RichTextEditor
                id={field.name}
                value={field.value}
                features={PROSE_FEATURES}
                placeholder={t("placeholder")}
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
