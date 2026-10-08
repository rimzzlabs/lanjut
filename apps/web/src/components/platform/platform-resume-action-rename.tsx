import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { Button } from "@lanjut/ui/components/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@lanjut/ui/components/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@lanjut/ui/components/input-group";
import { FloppyDiskIcon, TextTIcon, XIcon } from "@phosphor-icons/react";
import { useMemo } from "react";
import { Controller, useForm } from "react-hook-form";
import { useTranslations } from "use-intl";
import {
  ResponsiveDialog,
  ResponsiveDialogClose,
  ResponsiveDialogContent,
  ResponsiveDialogDescription,
  ResponsiveDialogFooter,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
} from "@/components/shared/responsive-dialog";
import { useValidationTranslator } from "@/hooks/use-validation-translator";
import {
  createResumeTitleSchema,
  RESUME_TITLE_MAX_LENGTH,
  type ResumeTitleForm,
} from "@/lib/forms/resume";
import { useResumeStore } from "@/lib/store";

interface PlatformResumeActionRenameProps {
  open: boolean;
  onOpenChange: (next: boolean) => void;
  resume: { id: string; title: string };
}

export function PlatformResumeActionRename(
  props: PlatformResumeActionRenameProps,
) {
  const renameResume = useResumeStore((state) => state.renameResume);
  const t = useTranslations("forms.rename");
  const tc = useTranslations("forms.common");
  const tv = useValidationTranslator();
  const schema = useMemo(() => createResumeTitleSchema(tv), [tv]);
  const form = useForm<ResumeTitleForm>({
    resolver: standardSchemaResolver(schema),
    defaultValues: { title: props.resume.title },
    mode: "onTouched",
  });

  const onSubmit = form.handleSubmit(async (values) => {
    if (values.title !== props.resume.title) {
      await renameResume(props.resume.id, values.title);
    }
    props.onOpenChange(false);
  });

  return (
    <ResponsiveDialog open={props.open} onOpenChange={props.onOpenChange}>
      <ResponsiveDialogContent showCloseButton={false}>
        <ResponsiveDialogHeader>
          <ResponsiveDialogTitle>{t("title")}</ResponsiveDialogTitle>
          <ResponsiveDialogDescription>
            {t("description")}
          </ResponsiveDialogDescription>
        </ResponsiveDialogHeader>

        <form onSubmit={onSubmit}>
          <FieldGroup>
            <Controller
              control={form.control}
              name="title"
              render={(controller) => {
                const { field, fieldState } = controller;
                return (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="rename-resume-title">
                      {t("label")}
                    </FieldLabel>
                    <InputGroup>
                      <InputGroupAddon>
                        <TextTIcon />
                      </InputGroupAddon>
                      <InputGroupInput
                        id="rename-resume-title"
                        maxLength={RESUME_TITLE_MAX_LENGTH}
                        placeholder={t("placeholder")}
                        aria-invalid={fieldState.invalid}
                        {...field}
                      />
                    </InputGroup>

                    <FieldDescription>{t("fieldDescription")}</FieldDescription>

                    <FieldError errors={[fieldState.error]} />
                  </Field>
                );
              }}
            />
          </FieldGroup>

          <ResponsiveDialogFooter className="mt-6">
            <ResponsiveDialogClose type="button" variant="outline">
              <XIcon /> {tc("cancel")}
            </ResponsiveDialogClose>

            <Button type="submit" disabled={form.formState.isSubmitting}>
              <FloppyDiskIcon /> {tc("save")}
            </Button>
          </ResponsiveDialogFooter>
        </form>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
}
