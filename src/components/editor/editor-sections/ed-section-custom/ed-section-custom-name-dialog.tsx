"use client";

import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { Save, TextInitial, XIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useMemo } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  ResponsiveDialog,
  ResponsiveDialogClose,
  ResponsiveDialogContent,
  ResponsiveDialogDescription,
  ResponsiveDialogFooter,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
} from "@/components/shared/responsive-dialog";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { useValidationTranslator } from "@/hooks/use-validation-translator";
import {
  createSectionTitleSchema,
  SECTION_TITLE_MAX_LENGTH,
  type SectionTitleForm,
} from "@/lib/forms/section";

interface EditorSectionCustomNameDialogProps {
  open: boolean;
  onOpenChange: (next: boolean) => void;
  /** Dialog heading and description text. */
  heading: string;
  description: string;
  /** Prefilled value: empty when adding, the current title when renaming. */
  initialValue: string;
  onSubmit: (title: string) => void;
}

export function EditorSectionCustomNameDialog(
  props: EditorSectionCustomNameDialogProps,
) {
  const t = useTranslations("editor.custom");
  const tc = useTranslations("forms.common");
  const tv = useValidationTranslator();
  const schema = useMemo(() => createSectionTitleSchema(tv), [tv]);
  const form = useForm<SectionTitleForm>({
    resolver: standardSchemaResolver(schema),
    defaultValues: { title: props.initialValue },
    mode: "onChange",
  });

  // Reset to the current value each time the dialog opens (add starts empty,
  // rename starts from the section's title).
  useEffect(() => {
    if (props.open) form.reset({ title: props.initialValue });
  }, [props.open, props.initialValue, form]);

  const onSubmit = form.handleSubmit((values) => {
    props.onSubmit(values.title);
    props.onOpenChange(false);
  });

  return (
    <ResponsiveDialog open={props.open} onOpenChange={props.onOpenChange}>
      <ResponsiveDialogContent showCloseButton={false}>
        <ResponsiveDialogHeader>
          <ResponsiveDialogTitle>{props.heading}</ResponsiveDialogTitle>
          <ResponsiveDialogDescription>
            {props.description}
          </ResponsiveDialogDescription>
        </ResponsiveDialogHeader>

        <form onSubmit={onSubmit}>
          <FieldGroup>
            <Controller
              control={form.control}
              name="title"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="custom-section-name">
                    {t("nameLabel")}
                  </FieldLabel>
                  <InputGroup>
                    <InputGroupAddon>
                      <TextInitial />
                    </InputGroupAddon>
                    <InputGroupInput
                      id="custom-section-name"
                      maxLength={SECTION_TITLE_MAX_LENGTH}
                      placeholder={t("namePlaceholder")}
                      aria-invalid={fieldState.invalid}
                      {...field}
                    />
                  </InputGroup>
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />
          </FieldGroup>

          <ResponsiveDialogFooter className="mt-6">
            <ResponsiveDialogClose type="button" variant="outline">
              <XIcon /> {tc("cancel")}
            </ResponsiveDialogClose>
            <Button type="submit" disabled={!form.formState.isValid}>
              <Save /> {tc("save")}
            </Button>
          </ResponsiveDialogFooter>
        </form>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
}
