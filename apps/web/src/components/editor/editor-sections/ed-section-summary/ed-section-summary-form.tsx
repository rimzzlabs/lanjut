import { PROSE_FEATURES } from "@lanjut/resume/schema-registry";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@lanjut/ui/components/field";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { useTranslations } from "use-intl";
import { useResumeStore } from "@/lib/store";
import { RichTextField } from "../../rich-text/rich-text-field";
import {
  applySummaryValues,
  type SummaryFormValues,
  toSummaryValues,
} from "../resume-form-adapter-profile";

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
      updateOpen((resume) => applySummaryValues(resume, form.getValues()));
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
          render={(controller) => {
            const { field, fieldState } = controller;
            return (
              <Field>
                <FieldLabel htmlFor={field.name}>{t("label")}</FieldLabel>
                <RichTextField
                  id={field.name}
                  value={field.value}
                  features={PROSE_FEATURES}
                  placeholder={t("placeholder")}
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
