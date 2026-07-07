"use client";

import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { Save, TextInitial, XIcon } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useValidationTranslator } from "@/hooks/use-validation-translator";
import { useRouter } from "@/i18n/navigation";
import {
  createResumeCreateSchema,
  RESUME_TITLE_MAX_LENGTH,
  type ResumeCreateForm,
} from "@/lib/forms/resume";
import type { ResumeLanguage } from "@/lib/resume";
import { useResumeStore } from "@/lib/store";
import { DEFAULT_TEMPLATE_ID, resolveTemplateId } from "@/lib/templates";
import {
  ResponsiveDialog,
  ResponsiveDialogClose,
  ResponsiveDialogContent,
  ResponsiveDialogDescription,
  ResponsiveDialogFooter,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
} from "../shared/responsive-dialog";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "../ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "../ui/input-group";
import { PlatformTemplateRadioGroup } from "./platform-template-radio-group";

interface PlatformResumeCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Prefills the label field. Remount (via `key`) to re-seed a new value. */
  initialTitle?: string;
  /** Presentation template for the new résumé; defaults to the starter (Awal). */
  templateId?: string;
}

export function PlatformResumeCreateDialog(
  props: PlatformResumeCreateDialogProps,
) {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("forms.create");
  const tc = useTranslations("forms.common");
  const tv = useValidationTranslator();
  const createResume = useResumeStore((state) => state.createResume);
  const [templateId, setTemplateId] = useState(() =>
    resolveTemplateId(props.templateId ?? DEFAULT_TEMPLATE_ID),
  );
  const schema = useMemo(() => createResumeCreateSchema(tv), [tv]);
  const form = useForm<ResumeCreateForm>({
    resolver: standardSchemaResolver(schema),
    defaultValues: { title: props.initialTitle ?? "", prefill: true },
    mode: "onChange",
  });

  const onSubmit = form.handleSubmit(async (values) => {
    const resume = await createResume(values.title, {
      templateId,
      prefill: values.prefill,
      language: locale as ResumeLanguage,
    });
    form.reset({ title: "", prefill: true });
    props.onOpenChange(false);
    router.push(`/platform/editor/${resume.id}`);
  });

  return (
    <ResponsiveDialog open={props.open} onOpenChange={props.onOpenChange}>
      <ResponsiveDialogContent className="sm:max-w-lg">
        <ResponsiveDialogHeader>
          <ResponsiveDialogTitle>{t("title")}</ResponsiveDialogTitle>
          <ResponsiveDialogDescription className="text-balance">
            {t("description")}
          </ResponsiveDialogDescription>
        </ResponsiveDialogHeader>

        <form onSubmit={onSubmit}>
          <FieldGroup>
            <Controller
              control={form.control}
              name="title"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="create-resume-title">
                    {t("label")}
                  </FieldLabel>
                  <InputGroup>
                    <InputGroupAddon>
                      <TextInitial />
                    </InputGroupAddon>
                    <InputGroupInput
                      id="create-resume-title"
                      maxLength={RESUME_TITLE_MAX_LENGTH}
                      placeholder={t("placeholder")}
                      aria-invalid={fieldState.invalid}
                      {...field}
                    />
                  </InputGroup>

                  <FieldDescription>{t("fieldDescription")}</FieldDescription>

                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />

            <Controller
              control={form.control}
              name="prefill"
              render={({ field }) => (
                <Field orientation="horizontal">
                  <Checkbox
                    id="create-resume-prefill"
                    name={field.name}
                    checked={field.value}
                    onCheckedChange={(checked) =>
                      field.onChange(checked === true)
                    }
                    onBlur={field.onBlur}
                    ref={field.ref}
                  />
                  <FieldLabel htmlFor="create-resume-prefill">
                    {t("prefill")}
                  </FieldLabel>
                </Field>
              )}
            />

            <Field>
              <FieldLabel>{t("template")}</FieldLabel>
              <PlatformTemplateRadioGroup
                value={templateId}
                onValueChange={setTemplateId}
              />
            </Field>
          </FieldGroup>

          <ResponsiveDialogFooter className="mt-6">
            <ResponsiveDialogClose type="button" variant="outline">
              <XIcon /> {tc("cancel")}
            </ResponsiveDialogClose>
            <Button type="submit" disabled={form.formState.isSubmitting}>
              <Save />
              {tc("save")}
            </Button>
          </ResponsiveDialogFooter>
        </form>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
}
